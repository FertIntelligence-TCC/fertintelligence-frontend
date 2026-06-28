import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
  CropCreateRequestDto, 
  CropPostRequestDto, 
  CropResponseDto,
  PlantSpacingMode,
} from "@/interfaces/Crop";

const PLANT_SPACING_MODES: PlantSpacingMode[] = ["plants_per_meter", "holes"];

const isPlantSpacingMode = (value?: string | null): value is PlantSpacingMode =>
  !!value && PLANT_SPACING_MODES.includes(value as PlantSpacingMode);

const hasLegacyPlantsPerMeter = (crop: CropResponseDto) =>
  Number.isFinite(crop.numero_plantas_por_metro) && crop.numero_plantas_por_metro > 0;

const normalizeCropResponse = (crop: CropResponseDto): CropResponseDto => {
  if (isPlantSpacingMode(crop.modo_espacamento) || !hasLegacyPlantsPerMeter(crop)) {
    return crop;
  }

  return {
    ...crop,
    modo_espacamento: "plants_per_meter",
  };
};

export const createCrop = async (
  folderId: number,
  data: CropCreateRequestDto
): Promise<CropResponseDto> => {
  const response = await api.post(ENDPOINT.CREATE_CROP, data, {
    params: { folderId }
  });
  return normalizeCropResponse(response.data);
};

export const getCropById = async (
  cropId: number
): Promise<CropResponseDto> => {
  const response = await api.get(ENDPOINT.GET_CROP, {
    params: { cropId }
  });
  return normalizeCropResponse(response.data);
};

export const getCropsByFolder = async (
  folderId: number
): Promise<CropResponseDto[]> => {
  const response = await api.get(ENDPOINT.GET_CROP_BY_FOLDER, {
    params: { folderId }
  });
  return response.data.map(normalizeCropResponse);
};

export const updateCrop = async (
  cropId: number,
  data: CropPostRequestDto
): Promise<CropResponseDto> => {
  const response = await api.put(ENDPOINT.UPDATE_CROP, data, {
    params: { cropId }
  });
  return normalizeCropResponse(response.data);
};

export const deleteCrop = async (
  cropId: number
): Promise<void> => {
  await api.delete(ENDPOINT.DELETE_CROP, {
    params: { cropId }
  });
};
