// Enums definidos no backend (ex: Genero.java, Formacao.java, Cargo.java)
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
}

// Tipos de atributos compostos esperados pelo backend
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

/**
 * Payload para criar um novo usuário.
 * Corresponde a UserCreateRequestDto.java
 */
export type SignUpPayload = {
  login: string; // @JsonProperty("login")
  cpf: string;
  email: string;
  datanasc: DataNasc;
  genero: Genero;
  telefone: Telefone;
  formacao: Formacao;
  profissao: string;
  cargo: Cargo;
  password: string;
  name: string; // @JsonProperty("name")
  // id_foto removido
};

/**
 * Payload para autenticar (login).
 * Corresponde aos parâmetros esperados pelo Spring Security.
 */
export type SignInPayload = {
  username: string;
  password: string;
};

/**
 * Payload para atualizar um usuário.
 * Corresponde a UserPostRequestDto.java.
 * Todos os campos são opcionais para permitir atualização parcial.
 */
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
  // id_nova_foto removido
};