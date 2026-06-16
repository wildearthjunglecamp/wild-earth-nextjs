import { redirect } from 'next/navigation';

// Occupancy detail is covered by the main Reports page for now.
export default function OccupancyReportPage() {
  redirect('/admin/reports');
}

// Made with Bob
