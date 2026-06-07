import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Revenue Report | Admin',
  description: 'View revenue analytics',
};

export default function RevenueReportPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Revenue Report</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Revenue report component to be implemented</p>
      </div>
    </div>
  );
}

// Made with Bob
