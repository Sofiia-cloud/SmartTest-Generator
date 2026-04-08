import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './Sidebar';
import { Header } from '../Header';

export function AdminLayout() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-background to-secondary">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto pt-16">
          <div className="p-6">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}