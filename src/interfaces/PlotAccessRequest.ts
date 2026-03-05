export type PlotAccessRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "REVOKED";

export type PermissionScope = "PROPERTY" | "PLOT";
export type PermissionType = "EDIT_ANALYSES" | "EDIT_ANALYSES_AND_CROPS";

export type PlotAccessRequestResponseDto = {
  id: number;

  id_propriedade?: number;
  nome_propriedade?: string;
  propertyId?: number;
  propertyName?: string;

  id_solicitante?: number;
  nome_solicitante?: string;
  requesterId?: number;
  requesterName?: string;

  cargo_solicitante?: string;
  requesterCargo?: string;

  email_solicitante?: string;
  requesterEmail?: string;

  id_talhao?: number;
  identificacao_talhao?: string;
  plotId?: number;
  plotIdentification?: string;

  status: PlotAccessRequestStatus;
  createdAt?: string;

  tipo_permissao?: PermissionType;
  permissionType?: PermissionType;

  Escopo?: PermissionScope;
  scope?: PermissionScope;
};