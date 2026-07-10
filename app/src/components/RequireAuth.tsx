import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../lib/useSession';

export function RequireAuth() {
  const { signedIn } = useSession();
  if (!signedIn) return <Navigate to="/login" replace />;
  return <Outlet />;
}
