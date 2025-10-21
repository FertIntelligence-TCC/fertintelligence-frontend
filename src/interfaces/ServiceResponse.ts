import { LocalizacaoPayload } from "./ServicePayload";

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

  export interface PropertyResponse { //
    id: number;
    nome: string;
    endereco: string;
    cnpj: string;
    localizacao: LocalizacaoPayload;
    ownerId: number;
    ownerNome: string;
}
  
  // export type GetCampaigsResponse = Campaign[];
  // export type GetCharactersResponse = Character[];
  // export type GetSystemsResponse = System[];