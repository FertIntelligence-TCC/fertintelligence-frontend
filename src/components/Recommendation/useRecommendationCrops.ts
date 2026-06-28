import { useEffect, useMemo, useState } from "react";

import type { CropResponseDto, PlantSpacingMode } from "@/interfaces/Crop";
import { getCropsByFolder } from "@/services/cropService";

type CropSpacingFormState = {
  rowDistance: string;
  plantSpacingMode: PlantSpacingMode;
  plantSpacingValue: string;
  plantsPerHole: string;
};

type UseRecommendationCropsInput = {
  annualCropFolderId: string;
  cropId: string;
  onCropChange: (value: string) => void;
  onSpacingChange: (state: CropSpacingFormState) => void;
  onLoadError: (error: unknown) => void;
};

const defaultSpacingFormState: CropSpacingFormState = {
  rowDistance: "",
  plantSpacingMode: "plants_per_meter",
  plantSpacingValue: "",
  plantsPerHole: "",
};

const defaultSpacingWarning =
  "Aviso técnico: estes campos refletem o espaçamento da cultura selecionada para conferência no frontend. O payload atual de geração envia apenas a cultura selecionada ao backend.";

const hasLegacyPlantsPerMeter = (crop: CropResponseDto) =>
  Number.isFinite(crop.numero_plantas_por_metro) && crop.numero_plantas_por_metro > 0;

const getCropSpacingWarning = (crop: CropResponseDto | null) => {
  if (!crop) return defaultSpacingWarning;

  if (!crop.modo_espacamento && !hasLegacyPlantsPerMeter(crop)) {
    return "Aviso técnico: cultura antiga sem modo de espaçamento e sem plantas/m linear para inferir automaticamente. O payload atual de geração envia apenas a cultura selecionada ao backend.";
  }

  return defaultSpacingWarning;
};

const buildSpacingFormState = (crop: CropResponseDto | null): CropSpacingFormState => {
  if (!crop) return defaultSpacingFormState;

  if (crop.modo_espacamento === "holes") {
    return {
      rowDistance: String(crop.distancia_entre_linhas ?? ""),
      plantSpacingMode: "holes",
      plantSpacingValue: String(crop.distancia_entre_plantas ?? ""),
      plantsPerHole: String(crop.numero_plantas_por_cova ?? ""),
    };
  }

  return {
    rowDistance: String(crop.distancia_entre_linhas ?? ""),
    plantSpacingMode: "plants_per_meter",
    plantSpacingValue: String(crop.numero_plantas_por_metro ?? ""),
    plantsPerHole: "",
  };
};

export function useRecommendationCrops({
  annualCropFolderId,
  cropId,
  onCropChange,
  onSpacingChange,
  onLoadError,
}: UseRecommendationCropsInput) {
  const [crops, setCrops] = useState<CropResponseDto[]>([]);
  const [loadingCrops, setLoadingCrops] = useState(false);

  const selectedCrop = useMemo(
    () => crops.find((crop) => String(crop.id) === cropId) ?? null,
    [crops, cropId],
  );

  const selectedCropSpacingWarning = useMemo(
    () => getCropSpacingWarning(selectedCrop),
    [selectedCrop],
  );

  useEffect(() => {
    let isCurrent = true;

    const loadCrops = async () => {
      onCropChange("");
      setCrops([]);

      if (!annualCropFolderId) return;

      setLoadingCrops(true);
      try {
        const data = await getCropsByFolder(Number(annualCropFolderId));
        if (isCurrent) setCrops(data ?? []);
      } catch (error) {
        console.error(error);
        if (isCurrent) onLoadError(error);
      } finally {
        if (isCurrent) setLoadingCrops(false);
      }
    };

    void loadCrops();

    return () => { isCurrent = false; };
  }, [annualCropFolderId, onCropChange, onLoadError]);

  useEffect(() => {
    onSpacingChange(buildSpacingFormState(selectedCrop));
  }, [onSpacingChange, selectedCrop]);

  return {
    crops,
    loadingCrops,
    selectedCrop,
    selectedCropSpacingWarning,
  };
}
