import { ENDPOINT } from "@/constants/Endpoint";
import type {
  CoverageCreateRequest,
  CoverageResponseDto,
  CoverageUpdateRequest,
} from "@/interfaces/CropFertilizationTable";

import { api } from "./axios";

export const createCoverage = async (
  contentRangeId: number,
  payload: CoverageCreateRequest
): Promise<CoverageResponseDto> => {
  const response = await api.post<CoverageResponseDto>(
    `${ENDPOINT.COVERAGE}/register`,
    payload,
    { params: { contentRangeId } }
  );
  return response.data;
};

export const fetchCoveragesByRange = async (contentRangeId: number): Promise<CoverageResponseDto[]> => {
    const response = await api.get<CoverageResponseDto[]>(`${ENDPOINT.COVERAGE}/get-by-range`, {
        params: { contentRangeId }
    });
    return response.data;
};

export const deleteCoverage = async (coverageId: number): Promise<void> => {
    await api.delete(`${ENDPOINT.COVERAGE}/delete`, {
        params: { coverageId }
    });
};

export const updateCoverage = async (
  coverageId: number,
  payload: CoverageUpdateRequest
): Promise<CoverageResponseDto> => {
  const response = await api.put<CoverageResponseDto>(
    `${ENDPOINT.COVERAGE}/update`,
    payload,
    { params: { coverageId } }
  );
  return response.data;
};
