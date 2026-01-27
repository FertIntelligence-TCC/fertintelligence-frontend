import { CropDate } from "./Crop";

// Enum para Micronutrientes (Baseado no uso comum e exemplos dos DTOs)
export type AppliedMicronutrient = 
  | 'BORO' 
  | 'COBRE' 
  | 'FERRO' 
  | 'MANGANES' 
  | 'MOLIBDENIO' 
  | 'ZINCO' 
  | 'NIQUEL'
  | 'CLORO'
  | string; // Permite flexibilidade caso existam outros no backend

// ==========================================
// Fonte Líquida (Liquid Source)
// ==========================================

export interface LiquidSourceResponseDto {
  id: number;
  id_cultura: number;
  data: CropDate;
  
  micronutriente_aplicado: AppliedMicronutrient;
  fonte: string;
  
  concentracao: number; // g/L ou %
  densidade: number;    // g/cm³
  volume_aplicado: number; // L/ha
  volume_calda: number;    // L/ha
}

export interface LiquidSourceCreateRequestDto {
  data: CropDate;
  
  micronutriente_aplicado: AppliedMicronutrient;
  fonte: string;
  
  concentracao: number;
  densidade: number;
  volume_aplicado: number;
  volume_calda: number;
}

export interface LiquidSourcePostRequestDto {
  // Campos de atualização com prefixo 'novo_'
  novo_data?: CropDate;
  
  novo_micronutriente_aplicado?: AppliedMicronutrient;
  novo_fonte?: string;
  
  novo_concentracao?: number;
  novo_densidade?: number;
  novo_volume_aplicado?: number;
  novo_volume_calda?: number;
}

// ==========================================
// Fonte Sólida (Solid Source)
// ==========================================

export interface SolidSourceResponseDto {
  id: number;
  id_cultura: number;
  data: CropDate;
  
  micronutriente_aplicado: AppliedMicronutrient;
  fonte: string;
  
  concentracao: number;      // % ou g/kg
  quantidade_aplicada: number; // kg/ha
}

export interface SolidSourceCreateRequestDto {
  data: CropDate;
  
  micronutriente_aplicado: AppliedMicronutrient;
  fonte: string;
  
  concentracao: number;
  quantidade_aplicada: number;
}

export interface SolidSourcePostRequestDto {
  // Campos de atualização com prefixo 'novo_'
  novo_data?: CropDate;
  
  novo_micronutriente_aplicado?: AppliedMicronutrient;
  novo_fonte?: string;
  
  novo_concentracao?: number;
  novo_quantidade_aplicada?: number;
}