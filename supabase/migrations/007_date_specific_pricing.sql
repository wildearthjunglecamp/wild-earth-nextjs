-- Migration 007: Date-Specific Pricing System
-- Allows administrators to set custom prices for tent types on specific dates

-- ============================================================================
-- 1. DATE SPECIFIC PRICING TABLE
-- ============================================================================
CREATE TABLE date_specific_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tent_type_id UUID NOT NULL REFERENCES tent_types(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  custom_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_custom_price CHECK (custom_price >= 0),
  CONSTRAINT unique_tent_type_date UNIQUE (tent_type_id, date)
);

-- Indexes for performance
CREATE INDEX idx_date_pricing_tent_type ON date_specific_pricing(tent_type_id);
CREATE INDEX idx_date_pricing_date ON date_specific_pricing(date);
CREATE INDEX idx_date_pricing_tent_type_date ON date_specific_pricing(tent_type_id, date);

-- Trigger for updated_at
CREATE TRIGGER update_date_specific_pricing_updated_at 
  BEFORE UPDATE ON date_specific_pricing
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. FUNCTION TO GET PRICE FOR TENT TYPE ON SPECIFIC DATE
-- ============================================================================
CREATE OR REPLACE FUNCTION get_tent_price_for_date(
  p_tent_type_id UUID,
  p_date DATE
)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  v_custom_price DECIMAL(10, 2);
  v_base_price DECIMAL(10, 2);
BEGIN
  -- Try to get custom price for the specific date
  SELECT custom_price INTO v_custom_price
  FROM date_specific_pricing
  WHERE tent_type_id = p_tent_type_id
  AND date = p_date;
  
  -- If custom price exists, return it
  IF v_custom_price IS NOT NULL THEN
    RETURN v_custom_price;
  END IF;
  
  -- Otherwise, return base price
  SELECT base_price INTO v_base_price
  FROM tent_types
  WHERE id = p_tent_type_id;
  
  RETURN v_base_price;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. FUNCTION TO GET PRICES FOR DATE RANGE
-- ============================================================================
CREATE OR REPLACE FUNCTION get_tent_prices_for_range(
  p_tent_type_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  date DATE,
  price DECIMAL(10, 2),
  is_custom_price BOOLEAN
) AS $$
DECLARE
  v_base_price DECIMAL(10, 2);
  v_current_date DATE;
BEGIN
  -- Get base price
  SELECT tt.base_price
  INTO v_base_price
  FROM tent_types tt
  WHERE tt.id = p_tent_type_id;

  -- Generate dates and prices
  v_current_date := p_start_date;

  WHILE v_current_date < p_end_date LOOP
    RETURN QUERY
    SELECT
      d.v_current_date AS date,
      COALESCE(dsp.custom_price, v_base_price) AS price,
      (dsp.custom_price IS NOT NULL) AS is_custom_price
    FROM (SELECT v_current_date AS v_current_date) AS d
    LEFT JOIN date_specific_pricing dsp
      ON dsp.tent_type_id = p_tent_type_id
     AND dsp.date = d.v_current_date;

    v_current_date := v_current_date + 1; -- DATE + 1 day
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. FUNCTION TO CALCULATE TOTAL PRICE FOR DATE RANGE
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_tent_total_for_range(
  p_tent_type_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_quantity INTEGER DEFAULT 1
)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  v_total DECIMAL(10, 2) := 0;
  v_price_record RECORD;
BEGIN
  -- Sum up prices for each night
  FOR v_price_record IN 
    SELECT price 
    FROM get_tent_prices_for_range(p_tent_type_id, p_start_date, p_end_date)
  LOOP
    v_total := v_total + v_price_record.price;
  END LOOP;
  
  -- Multiply by quantity
  RETURN v_total * p_quantity;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. FUNCTION TO BULK INSERT/UPDATE DATE SPECIFIC PRICING
-- ============================================================================
CREATE OR REPLACE FUNCTION upsert_date_specific_pricing(
  p_tent_type_id UUID,
  p_dates DATE[],
  p_custom_price DECIMAL(10, 2),
  p_notes TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS TABLE (
  inserted_count INTEGER,
  updated_count INTEGER
) AS $$
DECLARE
  v_date DATE;
  v_inserted INTEGER := 0;
  v_updated INTEGER := 0;
  v_exists BOOLEAN;
BEGIN
  -- Loop through each date
  FOREACH v_date IN ARRAY p_dates
  LOOP
    -- Check if pricing already exists
    SELECT EXISTS(
      SELECT 1 FROM date_specific_pricing 
      WHERE tent_type_id = p_tent_type_id AND date = v_date
    ) INTO v_exists;
    
    IF v_exists THEN
      -- Update existing
      UPDATE date_specific_pricing
      SET 
        custom_price = p_custom_price,
        notes = p_notes,
        updated_at = NOW()
      WHERE tent_type_id = p_tent_type_id AND date = v_date;
      
      v_updated := v_updated + 1;
    ELSE
      -- Insert new
      INSERT INTO date_specific_pricing (
        tent_type_id, 
        date, 
        custom_price, 
        notes, 
        created_by
      ) VALUES (
        p_tent_type_id, 
        v_date, 
        p_custom_price, 
        p_notes, 
        p_created_by
      );
      
      v_inserted := v_inserted + 1;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT v_inserted, v_updated;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. FUNCTION TO DELETE DATE SPECIFIC PRICING FOR DATE RANGE
-- ============================================================================
CREATE OR REPLACE FUNCTION delete_date_specific_pricing_range(
  p_tent_type_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM date_specific_pricing
  WHERE tent_type_id = p_tent_type_id
  AND date >= p_start_date
  AND date < p_end_date;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. VIEW FOR PRICING OVERVIEW
-- ============================================================================
CREATE VIEW pricing_overview AS
SELECT 
  tt.id as tent_type_id,
  tt.name as tent_type_name,
  tt.slug as tent_type_slug,
  tt.base_price,
  COUNT(dsp.id) as custom_price_count,
  MIN(dsp.date) as earliest_custom_date,
  MAX(dsp.date) as latest_custom_date
FROM tent_types tt
LEFT JOIN date_specific_pricing dsp ON tt.id = dsp.tent_type_id
GROUP BY tt.id, tt.name, tt.slug, tt.base_price
ORDER BY tt.name;

-- ============================================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE date_specific_pricing IS 'Stores custom prices for tent types on specific dates, overriding base prices';
COMMENT ON COLUMN date_specific_pricing.tent_type_id IS 'Reference to the tent type';
COMMENT ON COLUMN date_specific_pricing.date IS 'The specific date for custom pricing';
COMMENT ON COLUMN date_specific_pricing.custom_price IS 'Custom price that overrides base price for this date';
COMMENT ON COLUMN date_specific_pricing.notes IS 'Optional notes about why this custom price was set (e.g., holiday, special event)';

COMMENT ON FUNCTION get_tent_price_for_date IS 'Returns the price for a tent type on a specific date (custom or base)';
COMMENT ON FUNCTION get_tent_prices_for_range IS 'Returns daily prices for a tent type across a date range';
COMMENT ON FUNCTION calculate_tent_total_for_range IS 'Calculates total cost for a tent type across a date range with quantity';
COMMENT ON FUNCTION upsert_date_specific_pricing IS 'Bulk insert or update custom prices for multiple dates';
COMMENT ON FUNCTION delete_date_specific_pricing_range IS 'Delete custom prices for a date range';

-- Made with Bob