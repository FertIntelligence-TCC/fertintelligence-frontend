import { RouteObject } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import LoginPage from "../pages/Login";
import SignUpPage from "../pages/Signup";
import UpdateProfile from "../pages/UpdateProfile";
import DeleteProfile from "../pages/DeleteProfile";
import PasswordVerification from "../pages/UpdateVerification";
import UpdatePassword from "../pages/UpdatePassword";
import Home from "@/pages/Home";
import OthersPropertyManagement from "@/pages/OthersPropertyManagement";
import OwnerPropertyManagement from "@/pages/OwnerPropertyManagement";

export const PublicRoutes: RouteObject[] = [
  {
    path: "/fertintelligence/",
    element: <LoginPage />,
  },
  {
    path: "/fertintelligence/login",
    element: <LoginPage />,
  },
  {
    path: "/fertintelligence/home",
    element: <Home />,
  },
  {
    path: "/fertintelligence/signup",
    element: <SignUpPage />,
  },
  {
    path: "/fertintelligence/update-profile",
    element: <UpdateProfile />,
  },
  {
    path: "/fertintelligence/update-password",
    element: <UpdatePassword />,
  },
  {
    path: "/fertintelligence/password-verification",
    element: <PasswordVerification />,
  },
  {
    path: "/fertintelligence/delete-profile",
    element: <DeleteProfile />,
  },
  {
    path: "/fertintelligence/owner-property-management",
    element: <OwnerPropertyManagement />,
  },
  {
    path: "/fertintelligence/others-property-management",
    element: <OthersPropertyManagement />,
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        path: "/grimoire/home",
        element: <Home />,
      },
    ],
  },
];