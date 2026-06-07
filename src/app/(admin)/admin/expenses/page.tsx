import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expenses | Admin',
  description: 'Track and manage expenses',
};

export default function ExpensesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Expense Tracking</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Expenses table component to be implemented</p>
      </div>
    </div>
  );
}

// Made with Bob
