import { CropFertilizationTableCreateRequestDto, ContentRangeCreateRequestDto, CoverageCreateRequestDto } from "./CropFertilizationTable";

export enum LatitudeDirection {
    NORTE = 'NORTE',
    SUL = 'SUL',
  }
  
  export enum LongitudeDirection {
    LESTE = 'LESTE',
    OESTE = 'OESTE',
  }

  export interface LocalizacaoPayload { 
    latitude: number;
    latitudeDirection: LatitudeDirection;
    longitude: number;
    longitudeDirection: LongitudeDirection;
    altitude: number;
  }
  
  export interface PropertyCreatePayload {
      nome: string;
      endereco: string;
      cnpj: string;
      localizacao: LocalizacaoPayload;
  }
  
  export interface PropertyUpdatePayload {
      novo_nome?: string;
      novo_endereco?: string;
      novo_cnpj?: string;
      nova_localizacao?: LocalizacaoPayload;
  }

  export interface PropertyResponse { 
    id: number;
    nome: string;
    endereco: string;
    cnpj: string;
    localizacao: LocalizacaoPayload;
    ownerId: number;
    ownerNome: string;
}
  
  // Exports dos DTOs de Adubação para uso centralizado (Opcional, mas útil)
  export type { CropFertilizationTableCreateRequestDto, ContentRangeCreateRequestDto, CoverageCreateRequestDto };