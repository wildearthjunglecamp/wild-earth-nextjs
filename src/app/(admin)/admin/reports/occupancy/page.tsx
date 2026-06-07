import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Occupancy Report | Admin',
  description: 'View occupancy analytics',
};

export default function OccupancyReportPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Occupancy Report</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Occupancy report component to be implemented</p>
      </div>
    </div>
  );
}

// Made with Bob
