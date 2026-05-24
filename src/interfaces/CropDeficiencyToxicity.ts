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
  id_cultura: number;
  nutriente: DeficiencyToxicityNutrient;
  tipo_nutriente?: NutrientKind;
  idfoto_planta_saudavel?: string;
  idfoto_planta_sintoma?: string;
  observacoes?: string;
}

export interface CropDeficiencyToxicityCreateRequestDto {
  nutriente: DeficiencyToxicityNutrient;
  idfoto_planta_saudavel?: string;
  idfoto_planta_sintoma?: string;
  observacoes?: string;
}

export interface CropDeficiencyToxicityPostRequestDto {
  novo_nutriente?: DeficiencyToxicityNutrient;
  novo_idfoto_planta_saudavel?: string;
  novo_idfoto_planta_sintoma?: string;
  novo_observacoes?: string;
}
