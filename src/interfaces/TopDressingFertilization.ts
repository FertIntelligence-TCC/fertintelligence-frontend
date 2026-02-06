import { CropDate } from "./Crop";

export interface TopDressingFertilizationResponseDto {
  id: number;
  id_cultura: number;
  data: CropDate;
  ordem: number;

  // Fertilizantes (Quantidades em kg/ha ou similar)
  formulado?: number;
  sulfato_de_amonio?: number;
  ureia?: number;
  cloreto_de_potassio?: number;
  superfosfato_triplo?: number;
  superfosfato_simples?: number;
  monoamonio_fosfato?: number;
}

export interface TopDressingFertilizationCreateRequestDto {
  data: CropDate;
  ordem: number;

  formulado?: number;
  sulfato_de_amonio?: number;
  ureia?: number;
  cloreto_de_potassio?: number;
  superfosfato_triplo?: number;
  superfosfato_simples?: number;
  monoamonio_fosfato?: number;
}

export interface TopDressingFertilizationPostRequestDto {
  // Campos de atualização com prefixo 'novo_'
  novo_data?: CropDate;
  novo_ordem?: number;

  novo_formulado?: number;
  novo_sulfato_de_amonio?: number;
  novo_ureia?: number;
  novo_cloreto_de_potassio?: number;
  novo_superfosfato_triplo?: number;
  novo_superfosfato_simples?: number;
  novo_monoamonio_fosfato?: number;
}