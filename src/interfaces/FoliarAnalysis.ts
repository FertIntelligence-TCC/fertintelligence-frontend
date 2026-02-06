import { CropDate } from "./Crop";

// Sub-interfaces para os grupos de nutrientes
export interface MicronutrientsContent {
  b_content?: number;
  cu_content?: number;
  fe_content?: number;
  ni_content?: number;
  mn_content?: number;
  mo_content?: number;
  zn_content?: number;
}

export interface MacronutrientsContent {
  n_content?: number;
  p_content?: number;
  k_content?: number;
  ca_content?: number;
  mg_content?: number;
  s_content?: number;
}

export interface BeneficialElementsContent {
  na_content?: number;
  si_content?: number;
  v_content?: number;
  co_content?: number;
  se_content?: number;
}

// DTOs Principais

export interface FoliarAnalysisResponseDto {
  id: number;
  data_coleta: CropDate;
  laboratorio: string;
  
  // Conteúdos Aninhados
  micronutrientes?: MicronutrientsContent;
  macronutrientes?: MacronutrientsContent;
  elementos_beneficos?: BeneficialElementsContent;
  
  // Dados da Cultura Pai (Flattened no response)
  id_cultura: number;
  nome_cultura: string;
  variedade_cultura: string;
}

export interface FoliarAnalysisCreateRequestDto {
  data_coleta: CropDate;
  laboratorio: string;
  
  micronutrientes?: MicronutrientsContent;
  macronutrientes?: MacronutrientsContent;
  elementos_beneficos?: BeneficialElementsContent;
}

export interface FoliarAnalysisPostRequestDto {
  // Campos de atualização possuem prefixo 'novo_'
  novo_data_coleta?: CropDate;
  novo_laboratorio?: string;
  
  novo_micronutrientes?: MicronutrientsContent;
  novo_macronutrientes?: MacronutrientsContent;
  novo_elementos_beneficos?: BeneficialElementsContent;
}