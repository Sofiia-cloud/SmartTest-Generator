import { Outlet } from 'react-router-dom';
import { Header } from '../Header';
import { Footer } from '../Footer';

export function StudentLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex flex-col">
      <Header />
      <div className="flex-1 overflow-y-auto pt-16 pb-16">
        <main className="p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}