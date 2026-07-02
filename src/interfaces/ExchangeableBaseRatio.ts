export interface ExchangeableBaseRatioResponseDto {
  id: number;
  id_tabela: number;
  nome_exibicao?: string | null;
  unidade?: string | null;

  relacao_ca_mg_baixo: number | null;
  relacao_ca_mg_medio_menor_relacao: number | null;
  relacao_ca_mg_medio_maior_relacao: number | null;
  relacao_ca_mg_adequado_menor_relacao: number | null;
  relacao_ca_mg_adequado_maior_relacao: number | null;
  relacao_ca_mg_alto: number | null;

  relacao_ca_k_baixo: number | null;
  relacao_ca_k_medio_menor_relacao: number | null;
  relacao_ca_k_medio_maior_relacao: number | null;
  relacao_ca_k_adequado_menor_relacao: number | null;
  relacao_ca_k_adequado_maior_relacao: number | null;
  relacao_ca_k_alto: number | null;

  relacao_mg_k_baixo: number | null;
  relacao_mg_k_medio_menor_relacao: number | null;
  relacao_mg_k_medio_maior_relacao: number | null;
  relacao_mg_k_adequado_menor_relacao: number | null;
  relacao_mg_k_adequado_maior_relacao: number | null;
  relacao_mg_k_alto: number | null;

  relacao_ca_mg_sobre_k_baixo: number | null;
  relacao_ca_mg_sobre_k_medio_menor_relacao: number | null;
  relacao_ca_mg_sobre_k_medio_maior_relacao: number | null;
  relacao_ca_mg_sobre_k_adequado_menor_relacao: number | null;
  relacao_ca_mg_sobre_k_adequado_maior_relacao: number | null;
  relacao_ca_mg_sobre_k_alto: number | null;

  observacoes?: string | null;
  fontes?: string | null;
}

export type ExchangeableBaseRatioCreateRequestDto = Omit<
  ExchangeableBaseRatioResponseDto,
  "id" | "id_tabela" | "nome_exibicao" | "unidade"
>;

export interface ExchangeableBaseRatioPostRequestDto {
  [key: string]: number | string | undefined;
}
