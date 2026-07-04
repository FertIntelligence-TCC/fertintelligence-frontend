import type { AnnualCropFolderResponseDto } from "@/interfaces/AnnualCropFolder";
import type { CropResponseDto } from "@/interfaces/Crop";

import {
  type TableGroupValue,
  type TableOption,
  NativeSelect,
} from "./RecommendationSelectControls";
import RecommendationTableSelector from "./RecommendationTableSelector";

type CropTableSelectorsProps = {
  selectedPlotId: string;
  annualCropFolderId: string;
  cropId: string;
  annualCropFolders: AnnualCropFolderResponseDto[];
  crops: CropResponseDto[];
  annualCropFolderPlaceholder: string;
  cropPlaceholder: string;
  loadingAnnualCropFolders: boolean;
  loadingCrops: boolean;
  loadingTables: boolean;
  cropFertilizationTableGroup: TableGroupValue;
  soilFertilityInterpretationTableGroup: TableGroupValue;
  cropFoliarAnalysisInterpretationTableGroup: TableGroupValue;
  cropFertilizationTableId: string;
  soilFertilityInterpretationTableId: string;
  cropFoliarAnalysisInterpretationTableId: string;
  cropFertilizationTables: TableOption[];
  soilFertilityTables: TableOption[];
  foliarInterpretationTables: TableOption[];
  onAnnualCropFolderChange: (folderId: string) => void;
  onCropChange: (cropId: string) => void;
  onCropFertilizationTableGroupChange: (group: TableGroupValue) => void;
  onSoilFertilityInterpretationTableGroupChange: (group: TableGroupValue) => void;
  onCropFoliarAnalysisInterpretationTableGroupChange: (group: TableGroupValue) => void;
  onCropFertilizationTableChange: (tableId: string) => void;
  onSoilFertilityInterpretationTableChange: (tableId: string) => void;
  onCropFoliarAnalysisInterpretationTableChange: (tableId: string) => void;
};

const getFolderLabel = (folder: AnnualCropFolderResponseDto) =>
  folder.ano_culturas ? `Pasta anual ${folder.ano_culturas}` : `Pasta ${folder.id}`;

const getCropLabel = (crop: CropResponseDto) =>
  [crop.nome?.replace(/_/g, " "), crop.variedade, crop.tipo_cultivo].filter(Boolean).join(" • ") || `Cultura ${crop.id}`;

export default function CropTableSelectors({
  selectedPlotId,
  annualCropFolderId,
  cropId,
  annualCropFolders,
  crops,
  annualCropFolderPlaceholder,
  cropPlaceholder,
  loadingAnnualCropFolders,
  loadingCrops,
  loadingTables,
  cropFertilizationTableGroup,
  soilFertilityInterpretationTableGroup,
  cropFoliarAnalysisInterpretationTableGroup,
  cropFertilizationTableId,
  soilFertilityInterpretationTableId,
  cropFoliarAnalysisInterpretationTableId,
  cropFertilizationTables,
  soilFertilityTables,
  foliarInterpretationTables,
  onAnnualCropFolderChange,
  onCropChange,
  onCropFertilizationTableGroupChange,
  onSoilFertilityInterpretationTableGroupChange,
  onCropFoliarAnalysisInterpretationTableGroupChange,
  onCropFertilizationTableChange,
  onSoilFertilityInterpretationTableChange,
  onCropFoliarAnalysisInterpretationTableChange,
}: CropTableSelectorsProps) {
  const safeAnnualCropFolders = Array.isArray(annualCropFolders) ? annualCropFolders : [];
  const safeCrops = Array.isArray(crops) ? crops : [];
  const safeCropFertilizationTables = Array.isArray(cropFertilizationTables) ? cropFertilizationTables : [];
  const safeSoilFertilityTables = Array.isArray(soilFertilityTables) ? soilFertilityTables : [];
  const safeFoliarInterpretationTables = Array.isArray(foliarInterpretationTables) ? foliarInterpretationTables : [];

  return (
    <>
      <NativeSelect
        value={annualCropFolderId}
        onChange={(event) => onAnnualCropFolderChange(event.target.value)}
        disabled={!selectedPlotId || loadingAnnualCropFolders || safeAnnualCropFolders.length === 0}
      >
        {loadingAnnualCropFolders ? (
          <option>Carregando pastas anuais...</option>
        ) : (
          <>
            <option value="">{annualCropFolderPlaceholder}</option>
            {safeAnnualCropFolders.map((folder) => (
              <option key={folder.id} value={folder.id}>{getFolderLabel(folder)}</option>
            ))}
          </>
        )}
      </NativeSelect>

      <NativeSelect
        value={cropId}
        onChange={(event) => onCropChange(event.target.value)}
        disabled={!annualCropFolderId || loadingCrops || safeCrops.length === 0}
      >
        {loadingCrops ? (
          <option>Carregando culturas...</option>
        ) : (
          <>
            <option value="">{cropPlaceholder}</option>
            {safeCrops.map((crop) => (
              <option key={crop.id} value={crop.id}>{getCropLabel(crop)}</option>
            ))}
          </>
        )}
      </NativeSelect>

      <RecommendationTableSelector
        label="Tabela de adubação de culturas"
        group={cropFertilizationTableGroup}
        tableId={cropFertilizationTableId}
        tables={safeCropFertilizationTables}
        loadingTables={loadingTables}
        onGroupChange={onCropFertilizationTableGroupChange}
        onTableChange={onCropFertilizationTableChange}
      />
      <RecommendationTableSelector
        label="Tabela de interpretação da fertilidade do solo"
        group={soilFertilityInterpretationTableGroup}
        tableId={soilFertilityInterpretationTableId}
        tables={safeSoilFertilityTables}
        loadingTables={loadingTables}
        onGroupChange={onSoilFertilityInterpretationTableGroupChange}
        onTableChange={onSoilFertilityInterpretationTableChange}
      />
      <RecommendationTableSelector
        label="Tabela de interpretação de análise foliar (opcional)"
        group={cropFoliarAnalysisInterpretationTableGroup}
        tableId={cropFoliarAnalysisInterpretationTableId}
        tables={safeFoliarInterpretationTables}
        loadingTables={loadingTables}
        optional
        onGroupChange={onCropFoliarAnalysisInterpretationTableGroupChange}
        onTableChange={onCropFoliarAnalysisInterpretationTableChange}
      />
    </>
  );
}
