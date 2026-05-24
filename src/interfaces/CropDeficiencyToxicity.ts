export type NutrientKind = "MACRO" | "MICRO" | string;

export type DeficiencyToxicityNutrient =
  | "NITROGENIO"
  | "FOSFORO"
  | "POTASSIO"
  | "CALCIO"
  | "MAGNESIO"
  | "ENXOFRE"
  | "BORO"
  | "COBRE"
  | "FERRO"
  | "MANGANES"
  | "MOLIBDENIO"
  | "ZINCO"
  | "NIQUEL"
  | "CLORO"
  | string;

export interface CropDeficiencyToxicityResponseDto {
  id: number;
  cropId?: number;
  id_cultura?: number;
  nutrient: DeficiencyToxicityNutrient;
  nutrientType?: NutrientKind;
  healthyPlantImageId?: string;
  symptomaticPlantImageId?: string;
  observations?: string;
  // backward compatibility with legacy API keys
  nutriente?: DeficiencyToxicityNutrient;
  tipo_nutriente?: NutrientKind;
  idfoto_planta_saudavel?: string;
  idfoto_planta_sintoma?: string;
  observacoes?: string;
}

export interface CropDeficiencyToxicityCreateRequestDto {
  nutrient: DeficiencyToxicityNutrient;
  healthyPlantImageId?: string;
  symptomaticPlantImageId?: string;
  observations?: string;
}

export interface CropDeficiencyToxicityPostRequestDto {
  nutrient?: DeficiencyToxicityNutrient;
  healthyPlantImageId?: string;
  symptomaticPlantImageId?: string;
  observations?: string;
}
