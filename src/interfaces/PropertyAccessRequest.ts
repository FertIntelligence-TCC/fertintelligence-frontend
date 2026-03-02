// src/interfaces/PropertyAccess.ts
import { Cargo, AccessRequestStatus } from './Enums';

export interface PropertyAccessRequestResponse {
  id: number;
  id_propriedade: number;
  nome_propriedade: string;
  id_solicitante: number;
  nome_solicitante: string;
  cargo_solicitante: Cargo;
  email_solicitante: string;
  cpf_solicitante: string;
  status: AccessRequestStatus;
  data_criacao: string; // LocalDateTime vem como string ISO no JSON
}

export interface PropertyAccessRequestDecision {
  solicitacao_aprovada: boolean;
}

export interface PropertyAccessRequestCreate {
  id_propriedade: number;
}