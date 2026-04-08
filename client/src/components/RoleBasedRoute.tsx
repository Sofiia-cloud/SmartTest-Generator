import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from 'shared/config/roles';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRole: string;
}

export function RoleBasedRoute({ children, allowedRole }: RoleBasedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    const redirectPath = user.role === ROLES.ADMIN ? '/admin/dashboard' : '/student/quizzes';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}