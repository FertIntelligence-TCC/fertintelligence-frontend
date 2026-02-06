import { api } from "./axios"; 

export interface CoverageCreateRequest {
  ordem_cobertura: number;
  aplicacao_recomendada_cobertura: number | null;
}

export interface CoverageResponseDto {
  id: number;
  id_intervalo_teor: number;
  ordem_cobertura: number;
  aplicacao_recomendada_cobertura: number;
}

export const createCoverage = async (
  contentRangeId: number,
  payload: CoverageCreateRequest
): Promise<CoverageResponseDto> => {
  const response = await api.post<CoverageResponseDto>(
    `/coverage/register`,
    payload,
    { params: { contentRangeId } }
  );
  return response.data;
};

// NOVA FUNÇÃO: Buscar todas as coberturas de uma faixa
export const fetchCoveragesByRange = async (contentRangeId: number): Promise<CoverageResponseDto[]> => {
    const response = await api.get<CoverageResponseDto[]>(`/coverage/get-by-range`, {
        params: { contentRangeId }
    });
    return response.data;
};