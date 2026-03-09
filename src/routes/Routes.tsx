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
import ManagerPropertyManagement from "@/pages/property/ManagerPropertyManagement";
import ResidentAgronomistPropertyManagement from "@/pages/property/ResidentAgronomistPropertyManagement";
import ConsultantAgronomistPropertyManagement from "@/pages/property/ConsultantAgronomistPropertyManagement";
import SecretaryPropertyManagement from "@/pages/property/SecretaryPropertyManagement";
import AreaSupervisorPropertyManagement from "@/pages/property/AreaSupervisorPropertyManagement";
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
import { AnnualCropFolders } from "@/pages/plot-entities/AnnualCropFolders";
import ViewSolicitations from "@/pages/property-access/ViewSolicitations";
import ViewPlotSolicitations from "@/pages/property-access/ViewPlotSolicitations";
import ResidentAgronomistMakePlotSolicitations from "@/pages/make-plot-access-solicitation/ResidentAgronomistMakePlotSolicitations";
import ConsultantAgronomistMakePlotSolicitations from "@/pages/make-plot-access-solicitation/ConsultantAgronomistMakePlotSolicitations";
import SecretaryMakePlotSolicitations from "@/pages/make-plot-access-solicitation/SecretaryMakePlotSolicitations";


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
    path: "/fertintelligence/manager-property-management",
    element: <ManagerPropertyManagement />,
  },
  {
    path: "/fertintelligence/resident-agronomist-property-management",
    element: <ResidentAgronomistPropertyManagement />,
  },
  {
    path: "/fertintelligence/consultant-agronomist-property-management",
    element: <ConsultantAgronomistPropertyManagement />,
  },
  {
    path: "/fertintelligence/secretary-property-management",
    element: <SecretaryPropertyManagement />,
  },
  {
    path: "/fertintelligence/area-supervisor-property-management",
    element: <AreaSupervisorPropertyManagement />,
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
    path: "/fertintelligence/plots/:plotId/annual-crop-folders",
    element: <AnnualCropFolders />,
  },
  // Solicitações
  {
    path: "/fertintelligence/view-solicitations",
    element: <ViewSolicitations />
  },
  {
    path: "/fertintelligence/view-plot-solicitations",
    element: <ViewPlotSolicitations /> 
  },
    // Solicitações
  {
    path: "/fertintelligence/resident-agronomist-make-plot-solicitations",
    element: <ResidentAgronomistMakePlotSolicitations />,
  },
  {
    path: "/fertintelligence/consultant-agronomist-make-plot-solicitations",
    element: <ConsultantAgronomistMakePlotSolicitations />,
  },
  {
    path: "/fertintelligence/secretary-make-plot-solicitations",
    element: <SecretaryMakePlotSolicitations />,
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