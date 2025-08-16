import { RouteObject } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import LoginPage from "../pages/Login";
import SignUpPage from "../pages/Signup";
import UpdateProfile from "../pages/UpdateProfile";
import Home from "@/pages/Home";

export const PublicRoutes: RouteObject[] = [
  {
    path: "/fertintelligence/",
    element: <LoginPage />,
  },
  {
    path: "/fertintelligence/login/",
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
    element: <PrivateRoute />,
    children: [
      {
        path: "/grimoire/home",
        element: <Home />,
      },
    ],
  },
];