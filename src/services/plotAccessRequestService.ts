// src/services/plotAccessRequestService.ts

import { api } from "./axios";
import type {
  PlotAccessRequestResponseDto,
  PlotAccessRequestStatus,
  PermissionType,
} from "@/interfaces/PlotAccessRequest";

import { ENDPOINT } from "@/constants/Endpoint";

export async function requestPlotAccess(payload: {
  propertyId: number;
  plotId?: number | null;
  permissionType?: PermissionType | null;
}): Promise<PlotAccessRequestResponseDto> {
  const { propertyId, plotId = null, permissionType = null } = payload;

  const { data } = await api.post<PlotAccessRequestResponseDto>(`${ENDPOINT.PLOT_ACCESS}/request`, {
    id_propriedade: propertyId,
    id_talhao: plotId,
    tipo_permissao: permissionType,
  });

  return data;
}

export async function getPlotAccessRequests(params: {
  propertyId: number;
  status?: PlotAccessRequestStatus;
}): Promise<PlotAccessRequestResponseDto[]> {
  const { data } = await api.get<PlotAccessRequestResponseDto[]>(
    `${ENDPOINT.PLOT_ACCESS}/requests`,
    { params }
  );
  return data;
}

export async function decidePlotAccessRequest(params: {
  requestId: number;
  approve: boolean;
}): Promise<PlotAccessRequestResponseDto> {
  const { requestId, approve } = params;

  const { data } = await api.post<PlotAccessRequestResponseDto>(
    `${ENDPOINT.PLOT_ACCESS}/${requestId}/decision`,
    { solicitacao_aprovada: approve }
  );
  return data;
}

export async function revokePlotAccessRequest(
  requestId: number
): Promise<PlotAccessRequestResponseDto> {
  const { data } = await api.delete<PlotAccessRequestResponseDto>(
    `${ENDPOINT.PLOT_ACCESS}/${requestId}/revoke`
  );
  return data;
}
