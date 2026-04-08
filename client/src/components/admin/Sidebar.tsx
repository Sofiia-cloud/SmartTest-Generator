import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  FileText,
  ClipboardList,
  Settings,
} from 'lucide-react';

export function AdminSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  return (
    <aside className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col h-screen">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <Link to="/admin/documents">
            <Button
              variant={isActive('/admin/documents') ? 'default' : 'ghost'}
              className="w-full justify-start"
            >
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </Button>
          </Link>
          <Link to="/admin/quizzes">
            <Button
              variant={isActive('/admin/quizzes') ? 'default' : 'ghost'}
              className="w-full justify-start"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Quizzes
            </Button>
          </Link>
          <Link to="/admin/settings">
            <Button
              variant={isActive('/admin/settings') ? 'default' : 'ghost'}
              className="w-full justify-start"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </nav>
      </div>
    </aside>
  );
}