import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bookings | Admin',
  description: 'Manage all bookings',
};

export default function BookingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Bookings Management</h1>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-500">Bookings table component to be implemented</p>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
