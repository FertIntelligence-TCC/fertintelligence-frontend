export enum Genero {
  MASCULINO = "MASCULINO",
  FEMININO = "FEMININO",
  OUTRO = "OUTRO",
}

export enum Formacao {
  ENSINO_FUNDAMENTAL = "ENSINO_FUNDAMENTAL",
  ENSINO_MEDIO = "ENSINO_MEDIO",
  GRADUACAO = "GRADUACAO",
  MESTRADO = "MESTRADO",
  DOUTORADO = "DOUTORADO",
  POS_DOUTORADO = "POS_DOUTORADO",
}

export enum Cargo {
  PROPRIETARIO = "PROPRIETARIO",
  GERENTE = "GERENTE",
  AGRONOMO_RESIDENTE = "AGRONOMO_RESIDENTE",
  AGRONOMO_CONSULTOR = "AGRONOMO_CONSULTOR",
  SUPERVISOR_DE_AREA = "SUPERVISOR_DE_AREA",
  SECRETARIO = "SECRETARIO",
  USUARIO_SUPREMO = "USUARIO_SUPREMO",
}

export type DataNasc = {
  dia: number;
  mes: number;
  ano: number;
};

export type Telefone = {
  pais: string;
  ddd: string;
  numero: string;
};

export type SignUpPayload = {
  username: string;
  cpf: string;
  email: string;
  datanasc: DataNasc;
  genero: Genero;
  telefone: Telefone;
  formacao: Formacao;
  profissao: string;
  cargo: Cargo;
  senha: string;
  name: string;
  idfoto?: string;
};

export type SignInPayload = {
  username: string;
  password: string;
};

export type UpdateUserPayload = {
  novo_nome?: string;
  novo_cpf?: string;
  novo_email?: string;
  nova_datanasc?: DataNasc;
  novo_genero?: Genero;
  novo_telefone?: Telefone;
  nova_formacao?: Formacao;
  nova_profissao?: string;
  novo_cargo?: Cargo;
  nova_senha?: string;
  novo_idfoto?: string;
};

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
  idfoto?: string;
};
