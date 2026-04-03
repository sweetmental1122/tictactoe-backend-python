import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  return isLoggedIn() ? children : <Navigate to="/signin" replace />;
}
