import { Navigate, Outlet } from "react-router";

function protectedRoutes({ user, redirecTo = "/" }) {
  if (!user) {
    return <Navigate to={redirecTo} />;
  }
  return <Outlet />;
}

export default protectedRoutes;
