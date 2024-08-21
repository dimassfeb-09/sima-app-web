import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ isLoggedIn }: { isLoggedIn: boolean }) {
  return isLoggedIn ? <Outlet /> : <Navigate to="/auth/login" />;
}

export default ProtectedRoute;
