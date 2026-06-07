import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inventory | Admin',
  description: 'Manage tent inventory',
};

export default function InventoryPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Inventory Management</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Inventory table component to be implemented</p>
      </div>
    </div>
  );
}

// Made with Bob
