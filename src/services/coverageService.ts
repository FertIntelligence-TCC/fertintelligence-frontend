import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import type { CoverageCreateRequest, CoverageUpdateRequest, CoverageResponseDto } from "@/interfaces/CropFertilizationTable"; 

export const createCoverage = async (
  contentRangeId: number,
  payload: CoverageCreateRequest
): Promise<CoverageResponseDto> => {
  const response = await api.post<CoverageResponseDto>(
    ENDPOINT.CREATE_COVERAGE,
    payload,
    { params: { contentRangeId } }
  );
  return response.data;
};

// NOVA FUNÇÃO: Buscar todas as coberturas de uma faixa
export const fetchCoveragesByRange = async (contentRangeId: number): Promise<CoverageResponseDto[]> => {
    const response = await api.get<CoverageResponseDto[]>(ENDPOINT.GET_COVERAGE_BY_RANGE, {
        params: { contentRangeId }
    });
    return response.data;
};

export const deleteCoverage = async (coverageId: number): Promise<void> => {
    await api.delete(ENDPOINT.DELETE_COVERAGE, {
        params: { coverageId }
    });
};


export const updateCoverage = async (
  coverageId: number,
  payload: CoverageUpdateRequest
): Promise<CoverageResponseDto> => {
  const response = await api.put<CoverageResponseDto>(
    ENDPOINT.UPDATE_COVERAGE,
    payload,
    { params: { coverageId } }
  );
  return response.data;
};
