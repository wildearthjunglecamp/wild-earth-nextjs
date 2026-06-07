import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar | Admin',
  description: 'View bookings calendar',
};

export default function CalendarPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Booking Calendar</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Calendar view component to be implemented</p>
      </div>
    </div>
  );
}

// Made with Bob
