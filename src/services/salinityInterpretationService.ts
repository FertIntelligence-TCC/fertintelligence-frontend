import { api } from "./axios"; // Sua instância configurada do axios
import {
  SalinityInterpretationResponseDto,
  SalinityInterpretationCreateRequestDto,
  SalinityInterpretationPostRequestDto
} from "@/interfaces/SalinityInterpretation";

const ENDPOINT = "/salinity-interpretation";

export const getSalinityByTable = async (tableId: number): Promise<SalinityInterpretationResponseDto | null> => {
  try {
    const { data } = await api.get(`${ENDPOINT}/get-by-table`, {
      params: { tableId }
    });
    return data;
  } catch (error: any) {
    // Se for 404 (não existe ainda), retornamos null para o front abrir modo create
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createSalinity = async (tableId: number, payload: SalinityInterpretationCreateRequestDto) => {
  const { data } = await api.post(`${ENDPOINT}/register`, payload, {
    params: { tableId }
  });
  return data;
};

export const updateSalinity = async (criterionId: number, payload: SalinityInterpretationPostRequestDto) => {
  const { data } = await api.put(`${ENDPOINT}/update`, payload, {
    params: { criterionId }
  });
  return data;
};