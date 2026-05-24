export interface FertigramNutrient {
  nutrient: string;
  measuredValue?: number | null;
  recommendedMinimum?: number | null;
  recommendedMaximum?: number | null;
  unit?: string | null;
  interpretation?: string | null;
}

export interface FertigramResponse {
  foliarAnalysisId: number;
  tableId: number;
  cropName?: string | null;
  macronutrients: FertigramNutrient[];
  micronutrients: FertigramNutrient[];
}
