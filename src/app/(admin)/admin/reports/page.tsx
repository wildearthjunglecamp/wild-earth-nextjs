import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Reports | Admin',
  description: 'View business reports',
};

export default function ReportsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Revenue Reports</h2>
          <p className="text-gray-500 mb-4">View detailed revenue analytics and trends</p>
          <Link href="/admin/reports/revenue">
            <Button>View Revenue Report</Button>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Occupancy Reports</h2>
          <p className="text-gray-500 mb-4">Track occupancy rates and patterns</p>
          <Link href="/admin/reports/occupancy">
            <Button>View Occupancy Report</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
