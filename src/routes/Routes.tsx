import { RouteObject } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import LoginPage from "../pages/Login";
import SignUpPage from "../pages/profile/Signup";
import UpdateProfile from "../pages/profile/UpdateProfile";
import DeleteProfile from "../pages/profile/DeleteProfile";
import PasswordVerification from "../pages/profile/UpdateVerification";
import UpdatePassword from "../pages/profile/UpdatePassword";
import Home from "@/pages/Home";
import OthersPropertyManagement from "@/pages/property/OthersPropertyManagement";
import OwnerPropertyManagement from "@/pages/property/OwnerPropertyManagement";
import FertilizerManagement from "@/pages/fertilizer/FertilizerManagement";
import FertilizationTableManagement from "@/pages/fertilization-table/FertilizationTableManagement";

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
    path: "/fertintelligence/fertilization-table-management",
    element: <FertilizationTableManagement />,
  },
  {
    path: "/fertintelligence/fertilizer-management",
    element: <FertilizerManagement />,
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        path: "/fertintelligence/home",
        element: <Home />,
      },
    ],
  },
];