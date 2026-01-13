import { LocalizacaoPayload } from "./ServicePayload";
import { CropFertilizationTableResponseDto, ContentRangeResponseDto, CoverageResponseDto } from "./CropFertilizationTable";

export type DataNascDto = {
    dia: number;
    mes: number;
    ano: number;
  };
  
  export type TelefoneDto = {
    pais: string;
    ddd: string;
    numero: string;
  };

  export type UserResponse = {
    id?: number;
    login?: string;
    cpf?: string;
    email?: string;
    datanasc?: DataNascDto;
    genero?: string;
    telefone?: TelefoneDto;
    formacao?: string;
    profissao?: string;
    cargo?: string;
    name?: string;
  };

  export interface PropertyResponse { 
    id: number;
    nome: string;
    endereco: string;
    cnpj: string;
    localizacao: LocalizacaoPayload;
    ownerId: number;
    ownerNome: string;
}

// Exports para consistência
export type { CropFertilizationTableResponseDto, ContentRangeResponseDto, CoverageResponseDto };