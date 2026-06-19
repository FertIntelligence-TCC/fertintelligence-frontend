import { api } from "./axios";
import {
  FoliarAnalysisCreateRequestDto,
  FoliarAnalysisPostRequestDto,
  FoliarAnalysisResponseDto
} from "@/interfaces/FoliarAnalysis";

import { ENDPOINT } from "@/constants/Endpoint";

export const createFoliarAnalysis = async (
  cropId: number,
  data: FoliarAnalysisCreateRequestDto
): Promise<FoliarAnalysisResponseDto> => {
  const response = await api.post(`${ENDPOINT.FOLIAR_ANALYSIS}/register`, data, {
    params: { cropId }
  });
  return response.data;
};

export const getFoliarAnalysisById = async (
  analysisId: number
): Promise<FoliarAnalysisResponseDto> => {
  const response = await api.get(`${ENDPOINT.FOLIAR_ANALYSIS}/get`, {
    params: { analysisId }
  });
  return response.data;
};

export const getFoliarAnalysesByCrop = async (
  cropId: number
): Promise<FoliarAnalysisResponseDto[]> => {
  const response = await api.get(`${ENDPOINT.FOLIAR_ANALYSIS}/get-by-crop`, {
    params: { cropId }
  });
  return response.data;
};

export const updateFoliarAnalysis = async (
  analysisId: number,
  data: FoliarAnalysisPostRequestDto
): Promise<FoliarAnalysisResponseDto> => {
  const response = await api.put(`${ENDPOINT.FOLIAR_ANALYSIS}/update`, data, {
    params: { analysisId }
  });
  return response.data;
};

export const deleteFoliarAnalysis = async (
  analysisId: number
): Promise<void> => {
  await api.delete(`${ENDPOINT.FOLIAR_ANALYSIS}/delete`, {
    params: { analysisId }
  });
};
