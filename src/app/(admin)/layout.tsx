import { redirect } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Add authentication check here
  // const session = await getSession();
  // if (!session) redirect('/api/auth/login');

  return (
    <div className="flex min-h-screen">
      {/* Admin Sidebar - to be implemented */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-4">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="mt-8">
          {/* Navigation items will go here */}
        </nav>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Admin Header - to be implemented */}
        <header className="bg-white border-b px-8 py-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </header>
        
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// Made with Bob
