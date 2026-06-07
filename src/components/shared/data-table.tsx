'use client';

/**
 * Reusable Data Table Component
 * Generic table component for displaying tabular data
 */
interface DataTableProps {
  data: any[];
  columns: any[];
}

export function DataTable({ data, columns }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {/* Table headers to be implemented */}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Table rows to be implemented */}
        </tbody>
      </table>
    </div>
  );
}

// Made with Bob
