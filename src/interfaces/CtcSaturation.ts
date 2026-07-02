export interface CtcSaturationResponseDto {
  id: number;
  id_tabela: number;
  nome_exibicao?: string | null;
  unidade?: string | null;

  percentual_k_baixo: number | null;
  percentual_k_medio_menor_teor: number | null;
  percentual_k_medio_maior_teor: number | null;
  percentual_k_adequado_menor_teor: number | null;
  percentual_k_adequado_maior_teor: number | null;
  percentual_k_alto: number | null;

  percentual_ca_baixo: number | null;
  percentual_ca_medio_menor_teor: number | null;
  percentual_ca_medio_maior_teor: number | null;
  percentual_ca_adequado_menor_teor: number | null;
  percentual_ca_adequado_maior_teor: number | null;
  percentual_ca_alto: number | null;

  percentual_mg_baixo: number | null;
  percentual_mg_medio_menor_teor: number | null;
  percentual_mg_medio_maior_teor: number | null;
  percentual_mg_adequado_menor_teor: number | null;
  percentual_mg_adequado_maior_teor: number | null;
  percentual_mg_alto: number | null;

  observacoes?: string | null;
  fontes?: string | null;
}

export type CtcSaturationCreateRequestDto = Omit<
  CtcSaturationResponseDto,
  "id" | "id_tabela" | "nome_exibicao" | "unidade"
>;

export interface CtcSaturationPostRequestDto {
  [key: string]: number | string | undefined;
}
