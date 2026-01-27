import { api } from "./axios";
import { 
  FoliarAnalysisCreateRequestDto, 
  FoliarAnalysisPostRequestDto, 
  FoliarAnalysisResponseDto 
} from "@/interfaces/FoliarAnalysis";

const BASE_URL = "/foliar-analysis";

export const createFoliarAnalysis = async (
  cropId: number,
  data: FoliarAnalysisCreateRequestDto
): Promise<FoliarAnalysisResponseDto> => {
  const response = await api.post(`${BASE_URL}/register`, data, {
    params: { cropId }
  });
  return response.data;
};

export const getFoliarAnalysisById = async (
  analysisId: number
): Promise<FoliarAnalysisResponseDto> => {
  const response = await api.get(`${BASE_URL}/get`, {
    params: { analysisId }
  });
  return response.data;
};

export const getFoliarAnalysesByCrop = async (
  cropId: number
): Promise<FoliarAnalysisResponseDto[]> => {
  const response = await api.get(`${BASE_URL}/get-by-crop`, {
    params: { cropId }
  });
  return response.data;
};

export const updateFoliarAnalysis = async (
  analysisId: number,
  data: FoliarAnalysisPostRequestDto
): Promise<FoliarAnalysisResponseDto> => {
  const response = await api.put(`${BASE_URL}/update`, data, {
    params: { analysisId }
  });
  return response.data;
};

export const deleteFoliarAnalysis = async (
  analysisId: number
): Promise<void> => {
  await api.delete(`${BASE_URL}/delete`, {
    params: { analysisId }
  });
};