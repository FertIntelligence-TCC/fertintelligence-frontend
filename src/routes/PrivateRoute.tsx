import { useUserStore } from "../stores/user/user.store"
import { Navigate, Outlet } from "react-router-dom";

export const PrivateRoute = () => {
  const user = useUserStore((state) => state.user);

  if (!user) {
    return <Navigate to="/fertintelligence/" />;
  }

  return <Outlet />;
};