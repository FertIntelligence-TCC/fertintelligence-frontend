import type { CropResponseDto, PlantSpacingMode } from "@/interfaces/Crop";

export const buildCropSpacingFields = (
  mode: PlantSpacingMode,
  distanceBetweenPits: string,
  plantsPerPit: string,
  plantsPerMeter: string,
  currentCrop?: CropResponseDto | null,
) => {
  const computedPlantsPerMeter = mode === "holes"
    ? Number(plantsPerPit) / Number(distanceBetweenPits)
    : Number(plantsPerMeter);

  return {
    numero_plantas_por_metro: Number.isFinite(computedPlantsPerMeter) ? computedPlantsPerMeter : 0,
    distancia_entre_covas: mode === "holes"
      ? Number(distanceBetweenPits) || 0
      : currentCrop?.distancia_entre_covas ?? null,
    numero_plantas_por_cova: mode === "holes"
      ? Number(plantsPerPit) || 0
      : currentCrop?.numero_plantas_por_cova ?? null,
  };
};

export const getCropSpacingValidationMessage = (
  mode: PlantSpacingMode,
  distanceBetweenLines: string,
  distanceBetweenPits: string,
  plantsPerPit: string,
  plantsPerMeter: string,
): string => {
  if (!(Number(distanceBetweenLines) > 0)) return "A distância entre linhas deve ser maior que zero.";
  if (mode === "holes" && !(Number(distanceBetweenPits) > 0)) {
    return "O modo Distância entre covas (m) exige distância entre covas maior que zero.";
  }
  if (mode === "holes" && !(Number(plantsPerPit) > 0)) {
    return "O modo Distância entre covas (m) exige número de plantas por cova maior que zero.";
  }
  if (mode === "plants_per_meter" && !(Number(plantsPerMeter) > 0)) {
    return "O modo Nº de Plantas/m linear exige número de plantas por metro linear maior que zero.";
  }
  return "";
};
