import type { SoilAnalysisResponse } from "@/interfaces/SoilAnalysis";

import {
  type AnalysisOption,
  NativeSelect,
} from "./RecommendationSelectControls";

type AnalysisSelectorsProps = {
  selectedPlotId: string;
  loadingPlotAnalyses: boolean;
  physicalAnalysisId: string;
  fertilityAnalysisId: string;
  saturationExtractAnalysisId: string;
  physicalAnalysisOptions: AnalysisOption<SoilAnalysisResponse>[];
  fertilityAnalysisOptions: AnalysisOption<SoilAnalysisResponse>[];
  saturationExtractAnalysisOptions: AnalysisOption<SoilAnalysisResponse>[];
  physicalAnalysisPlaceholder: string;
  fertilityAnalysisPlaceholder: string;
  saturationExtractAnalysisPlaceholder: string;
  onPhysicalAnalysisChange: (analysisId: string) => void;
  onFertilityAnalysisChange: (analysisId: string) => void;
  onSaturationExtractAnalysisChange: (analysisId: string) => void;
};

export default function AnalysisSelectors({
  selectedPlotId,
  loadingPlotAnalyses,
  physicalAnalysisId,
  fertilityAnalysisId,
  saturationExtractAnalysisId,
  physicalAnalysisOptions,
  fertilityAnalysisOptions,
  saturationExtractAnalysisOptions,
  physicalAnalysisPlaceholder,
  fertilityAnalysisPlaceholder,
  saturationExtractAnalysisPlaceholder,
  onPhysicalAnalysisChange,
  onFertilityAnalysisChange,
  onSaturationExtractAnalysisChange,
}: AnalysisSelectorsProps) {
  return (
    <>
      <NativeSelect
        value={physicalAnalysisId}
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
        value={fertilityAnalysisId}
        onChange={(event) => onFertilityAnalysisChange(event.target.value)}
        disabled={!selectedPlotId || loadingPlotAnalyses || fertilityAnalysisOptions.length === 0}
      >
        {loadingPlotAnalyses ? (
          <option>Carregando análises de fertilidade...</option>
        ) : (
          <>
            <option value="">{fertilityAnalysisPlaceholder}</option>
            {fertilityAnalysisOptions.map((analysis) => (
              <option key={analysis.id} value={analysis.id}>{analysis.label}</option>
            ))}
          </>
        )}
      </NativeSelect>

      <NativeSelect
        value={saturationExtractAnalysisId}
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
