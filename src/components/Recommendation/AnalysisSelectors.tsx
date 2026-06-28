import type { FertilityAnalysisExtractResponse } from "@/interfaces/FertilityAnalysisExtract";
import type { PhysicalAnalysisExtractResponse } from "@/interfaces/PhysicalAnalysisExtract";
import type { SaturationExtractAnalysisExtractResponse } from "@/interfaces/SaturationExtractAnalysisExtract";

import {
  type AnalysisExtractOption,
  NativeSelect,
} from "./RecommendationSelectControls";

type AnalysisSelectorsProps = {
  selectedPlotId: string;
  loadingPlotAnalyses: boolean;
  physicalAnalysisExtractId: string;
  soilFertilityAnalysisId: string;
  saturationExtractAnalysisExtractId: string;
  physicalAnalysisOptions: AnalysisExtractOption<PhysicalAnalysisExtractResponse>[];
  soilFertilityAnalysisOptions: AnalysisExtractOption<FertilityAnalysisExtractResponse>[];
  saturationExtractAnalysisOptions: AnalysisExtractOption<SaturationExtractAnalysisExtractResponse>[];
  physicalAnalysisPlaceholder: string;
  soilFertilityAnalysisPlaceholder: string;
  saturationExtractAnalysisPlaceholder: string;
  onPhysicalAnalysisChange: (analysisId: string) => void;
  onSoilFertilityAnalysisChange: (analysisId: string) => void;
  onSaturationExtractAnalysisChange: (analysisId: string) => void;
};

export default function AnalysisSelectors({
  selectedPlotId,
  loadingPlotAnalyses,
  physicalAnalysisExtractId,
  soilFertilityAnalysisId,
  saturationExtractAnalysisExtractId,
  physicalAnalysisOptions,
  soilFertilityAnalysisOptions,
  saturationExtractAnalysisOptions,
  physicalAnalysisPlaceholder,
  soilFertilityAnalysisPlaceholder,
  saturationExtractAnalysisPlaceholder,
  onPhysicalAnalysisChange,
  onSoilFertilityAnalysisChange,
  onSaturationExtractAnalysisChange,
}: AnalysisSelectorsProps) {
  return (
    <>
      <NativeSelect
        value={physicalAnalysisExtractId}
        onChange={(event) => onPhysicalAnalysisChange(event.target.value)}
        disabled={!selectedPlotId || loadingPlotAnalyses || physicalAnalysisOptions.length === 0}
      >
        {loadingPlotAnalyses ? (
          <option>Carregando análises físicas...</option>
        ) : (
          <>
            <option value="">{physicalAnalysisPlaceholder}</option>
            {physicalAnalysisOptions.map((analysis) => (
              <option key={analysis.id} value={analysis.id}>{analysis.label}</option>
            ))}
          </>
        )}
      </NativeSelect>

      <NativeSelect
        value={soilFertilityAnalysisId}
        onChange={(event) => onSoilFertilityAnalysisChange(event.target.value)}
        disabled={!selectedPlotId || loadingPlotAnalyses || soilFertilityAnalysisOptions.length === 0}
      >
        {loadingPlotAnalyses ? (
          <option>Carregando análises de fertilidade...</option>
        ) : (
          <>
            <option value="">{soilFertilityAnalysisPlaceholder}</option>
            {soilFertilityAnalysisOptions.map((analysis) => (
              <option key={analysis.id} value={analysis.id}>{analysis.label}</option>
            ))}
          </>
        )}
      </NativeSelect>

      <NativeSelect
        value={saturationExtractAnalysisExtractId}
        onChange={(event) => onSaturationExtractAnalysisChange(event.target.value)}
        disabled={!selectedPlotId || loadingPlotAnalyses || saturationExtractAnalysisOptions.length === 0}
      >
        {loadingPlotAnalyses ? (
          <option>Carregando análises de extrato de saturação...</option>
        ) : (
          <>
            <option value="">{saturationExtractAnalysisPlaceholder}</option>
            {saturationExtractAnalysisOptions.map((analysis) => (
              <option key={analysis.id} value={analysis.id}>{analysis.label}</option>
            ))}
          </>
        )}
      </NativeSelect>
    </>
  );
}

