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
import CropFertilizationTable from "@/pages/fertilization-table/CropFertilizationTable";
import FoliarAnalysisInterpretationTable from "@/pages/fertilization-table/FoliarAnalysisInterpretationTable";
import SoilFertilityInterpretationTable from "@/pages/fertilization-table/SoilFertilityInterpretationTable";
import BioFertilizer from "@/pages/fertilizer/BioFertilizer";
import ChelatedFertilizer from "@/pages/fertilizer/ChelatedFertilizer";
import FoliarMineralFertilizer from "@/pages/fertilizer/FoliarMineralFertilizer";
import FormulatedMineralFertilizer from "@/pages/fertilizer/FormulatedMineralFertilizer";
import GreenFertilizer from "@/pages/fertilizer/GreenFertilizer";
import SimpleMineralFertilizer from "@/pages/fertilizer/SimpleMineralFertilizer";
import OrganoMineralFertilizer from "@/pages/fertilizer/OrganoMineralFertilizer";
import { PhysicalAnalysis } from "@/pages/plot-entities/PhysicalAnalysis";
import { FertilityAnalysis } from "@/pages/plot-entities/FertilityAnalysis";
import { SaturationExtractAnalysis } from "@/pages/plot-entities/SaturationExtractAnalysis";
import { AnnualCropFolder } from "@/pages/plot-entities/AnnualCropFolder";


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
    path: "/fertintelligence/fertilization-table-management/crop-fertilization-table",
    element: <CropFertilizationTable />,
  },
  {
    path: "/fertintelligence/fertilization-table-management/foliar-analysis-interpretation-table",
    element: <FoliarAnalysisInterpretationTable />,
  },
  {
    path: "/fertintelligence/fertilization-table-management/soil-fertility-interpretation-table",
    element: <SoilFertilityInterpretationTable />,
  },
  {
    path: "/fertintelligence/fertilizer-management/bio-fertilizer",
    element: <BioFertilizer />,
  },
  {
    path: "/fertintelligence/fertilizer-management/chelated-fertilizer",
    element: <ChelatedFertilizer />,
  },
  {
    path: "/fertintelligence/fertilizer-management/foliar-mineral-fertilizer",
    element: <FoliarMineralFertilizer />,
  },
  {
    path: "/fertintelligence/fertilizer-management/formulated-mineral-fertilizer",
    element: <FormulatedMineralFertilizer />,
  },
  {
    path: "/fertintelligence/fertilizer-management/green-fertilizer",
    element: <GreenFertilizer />,
  },
  {
    path: "/fertintelligence/fertilizer-management/organo-mineral-fertilizer",
    element: <OrganoMineralFertilizer />,
  },
  {
    path: "/fertintelligence/fertilizer-management/simple-mineral-fertilizer",
    element: <SimpleMineralFertilizer />,
  },
  {
    path: "/fertintelligence/plots/:plotId/physical-analysis",
    element: <PhysicalAnalysis />,
  },
  {
    path: "/fertintelligence/plots/:plotId/fertility-analysis",
    element: <FertilityAnalysis />,
  },
  {
    path: "/fertintelligence/plots/:plotId/saturation-extract",
    element: <SaturationExtractAnalysis />,
  },
  {
    path: "/fertintelligence/plots/:plotId/annual-crop-folder",
    element: <AnnualCropFolder />,
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