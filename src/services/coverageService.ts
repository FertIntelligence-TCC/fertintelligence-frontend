import { api } from "./axios"; 

export interface CoverageCreateRequest {
  ordem_cobertura: number;
  aplicacao_recomendada_cobertura: number | null;
}

export interface CoverageUpdateRequest {
  novo_ordem_cobertura: number;
  novo_aplicacao_recomendada_cobertura: number | null;
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

export const deleteCoverage = async (coverageId: number): Promise<void> => {
    await api.delete(`/coverage/delete`, {
        params: { coverageId }
    });
};


export const updateCoverage = async (
  coverageId: number,
  payload: CoverageUpdateRequest
): Promise<CoverageResponseDto> => {
  const response = await api.put<CoverageResponseDto>(
    `/coverage/update`,
    payload,
    { params: { coverageId } }
  );
  return response.data;
};
