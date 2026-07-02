export interface RecommendedLimestoneTypeResponseDto {
  id: number;
  id_tabela: number;
  nome_exibicao?: string | null;

  relacao_ca_mg_baixa: number | null;
  relacao_ca_mg_media_menor_valor: number | null;
  relacao_ca_mg_media_maior_valor: number | null;
  relacao_ca_mg_alta: number | null;

  legenda_relacao_ca_mg_baixa?: string | null;
  legenda_relacao_ca_mg_media_menor_valor?: string | null;
  legenda_relacao_ca_mg_media_maior_valor?: string | null;
  legenda_relacao_ca_mg_alta?: string | null;

  observacoes?: string | null;
  fontes?: string | null;
}

export type RecommendedLimestoneTypeCreateRequestDto = Omit<
  RecommendedLimestoneTypeResponseDto,
  | "id"
  | "id_tabela"
  | "nome_exibicao"
  | "legenda_relacao_ca_mg_baixa"
  | "legenda_relacao_ca_mg_media_menor_valor"
  | "legenda_relacao_ca_mg_media_maior_valor"
  | "legenda_relacao_ca_mg_alta"
>;

export interface RecommendedLimestoneTypePostRequestDto {
  [key: string]: number | string | undefined;
}
