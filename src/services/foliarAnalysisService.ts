import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
  FoliarAnalysisCreateRequestDto, 
  FoliarAnalysisPostRequestDto, 
  FoliarAnalysisResponseDto 
} from "@/interfaces/FoliarAnalysis";


export const createFoliarAnalysis = async (
  cropId: number,
  data: FoliarAnalysisCreateRequestDto
): Promise<FoliarAnalysisResponseDto> => {
  const response = await api.post(ENDPOINT.CREATE_FOLIAR_ANALYSIS, data, {
    params: { cropId }
  });
  return response.data;
};

export const getFoliarAnalysisById = async (
  analysisId: number
): Promise<FoliarAnalysisResponseDto> => {
  const response = await api.get(ENDPOINT.GET_FOLIAR_ANALYSIS, {
    params: { analysisId }
  });
  return response.data;
};

export const getFoliarAnalysesByCrop = async (
  cropId: number
): Promise<FoliarAnalysisResponseDto[]> => {
  const response = await api.get(ENDPOINT.GET_BY_CROP_FOLIAR_ANALYSIS, {
    params: { cropId }
  });
  return response.data;
};

export const updateFoliarAnalysis = async (
  analysisId: number,
  data: FoliarAnalysisPostRequestDto
): Promise<FoliarAnalysisResponseDto> => {
  const response = await api.put(ENDPOINT.UPDATE_FOLIAR_ANALYSIS, data, {
    params: { analysisId }
  });
  return response.data;
};

export const deleteFoliarAnalysis = async (
  analysisId: number
): Promise<void> => {
  await api.delete(ENDPOINT.DELETE_FOLIAR_ANALYSIS, {
    params: { analysisId }
  });
};
