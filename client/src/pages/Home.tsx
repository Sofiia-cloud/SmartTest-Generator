import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@shared/config/roles';

export function Home() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const navigationAttempted = useRef(false);

  useEffect(() => {
    // Prevent multiple navigation attempts
    if (navigationAttempted.current) {
      console.log('[Home] Navigation already attempted, skipping');
      return;
    }

    console.log('[Home] Checking authentication:', { isAuthenticated, user, userRole: user?.role });

    if (!isAuthenticated || !user) {
      console.log('[Home] Not authenticated, redirecting to login');
      navigationAttempted.current = true;
      navigate('/login');
      return;
    }

    console.log('[Home] User authenticated with role:', user.role);
    navigationAttempted.current = true;

    if (user.role === ROLES.ADMIN) {
      console.log('[Home] User is admin, redirecting to /admin/documents');
      navigate('/admin/documents');
    } else if (user.role === ROLES.STUDENT) {
      console.log('[Home] User is student, redirecting to /student/quizzes');
      navigate('/student/quizzes');
    } else {
      console.warn('[Home] User role is unknown or invalid:', user.role, '| Expected "admin" or "student"');
      // If role is not recognized, default to student quizzes
      navigate('/student/quizzes');
    }
  }, []); // Empty dependency array - run only once on mount

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}