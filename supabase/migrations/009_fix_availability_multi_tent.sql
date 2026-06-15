-- ============================================================================
-- Migration 009: Fix availability check for the multi-tent model
-- ============================================================================
-- Bug: check_tent_availability still queried the deprecated single-tent model
-- (bookings.tent_id + legacy bookings.status). Since migration 005, tent
-- assignments live in the booking_tents junction table and bookings.tent_id is
-- always NULL, so the function never detected overlaps and the availability
-- page reported tents as available even when fully booked — while
-- create_booking_with_payment (migration 006) correctly rejected them.
--
-- This rewrites check_tent_availability to read booking_tents joined to
-- bookings, using the SAME overlap + status rules as create_booking_with_payment
-- so the availability page and booking creation always agree:
--   * a tent is blocked by any booking whose date range overlaps, unless that
--     booking is 'cancelled' or 'no_show'.
--
-- check_tent_availability is called by get_available_tents and
-- get_available_tents_by_type, so this single fix corrects every read path.
--
-- NOTE: SECURITY DEFINER + search_path are re-declared here to preserve the
-- attributes set in migration 008 (CREATE OR REPLACE would otherwise reset them
-- to SECURITY INVOKER, breaking availability reads under RLS).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_tent_availability(
  p_tent_id uuid,
  p_check_in date,
  p_check_out date
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Invalid range is never "available"
  IF p_check_in >= p_check_out THEN
    RETURN false;
  END IF;

  -- A tent is available when no active booking's date range overlaps the
  -- requested range. Overlap rule (half-open intervals, allows same-day
  -- turnover): existing.check_in < requested.check_out
  --        AND  existing.check_out > requested.check_in
  RETURN NOT EXISTS (
    SELECT 1
    FROM booking_tents bt
    INNER JOIN bookings b ON b.id = bt.booking_id
    WHERE bt.tent_id = p_tent_id
      AND b.booking_status NOT IN ('cancelled', 'no_show')
      AND b.check_in < p_check_out
      AND b.check_out > p_check_in
  );
END;
$$;

COMMENT ON FUNCTION check_tent_availability IS
'Returns true if the tent has no overlapping active booking (via booking_tents)
for the given date range. Blocks all booking_status values except cancelled and
no_show, matching create_booking_with_payment.';

-- Made with Bob
