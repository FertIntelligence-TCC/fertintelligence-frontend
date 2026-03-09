import { Cargo } from "@/interfaces/User";
import type {
  PermissionType,
  PlotAccessRequestStatus,
} from "@/interfaces/PlotAccessRequest";

export type AccessCardStatus = "NONE" | "PENDING" | "APPROVED";

export type AuthorizationRoleMode =
  | "OWNER"
  | "MANAGER"
  | "RESIDENT"
  | "CONSULTANT"
  | "SECRETARY"
  | "SUPERVISOR"
  | "OTHER";

export type NormalizedPlotPermission = {
  id: number;
  propertyId: number;
  plotId: number | null;
  requesterId: number;
  requesterName?: string;
  requesterCargo?: string;
  plotIdentification?: string;
  status: PlotAccessRequestStatus;
  permissionType: PermissionType | null;
};

const normalizeCargo = (value?: string) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_-]+/g, "")
    .toUpperCase();

export const getAuthorizationRoleMode = (
  cargo?: string
): AuthorizationRoleMode => {
  const normalized = normalizeCargo(cargo);

  if (normalized === normalizeCargo(Cargo.PROPRIETARIO)) return "OWNER";
  if (normalized === normalizeCargo(Cargo.GERENTE)) return "MANAGER";
  if (normalized === normalizeCargo(Cargo.AGRONOMO_RESIDENTE)) return "RESIDENT";
  if (normalized === normalizeCargo(Cargo.AGRONOMO_CONSULTOR)) return "CONSULTANT";
  if (normalized === normalizeCargo(Cargo.SECRETARIO)) return "SECRETARY";
  if (normalized === normalizeCargo(Cargo.SUPERVISOR_DE_AREA)) return "SUPERVISOR";

  return "OTHER";
};

export const getPermissionDeniedMessage = () =>
  "Você não tem permissão para editar esse recurso!";