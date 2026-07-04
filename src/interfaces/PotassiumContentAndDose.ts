export interface PotassiumContentAndDoseResponseDto {
  id: number;
  id_tabela: number;

  teor_baixo_menor_ctc_menor_40: number | null;
  dose_teor_baixo_ctc_menor_40: number | null;
  medio_menor_teor_ctc_menor_40: number | null;
  medio_maior_teor_ctc_menor_40: number | null;
  dose_teor_medio_ctc_menor_40: number | null;
  adequado_menor_teor_ctc_menor_40: number | null;
  adequado_maior_teor_ctc_menor_40: number | null;
  dose_teor_adequado_ctc_menor_40: number | null;
  teor_alto_maior_ctc_menor_40: number | null;
  dose_teor_alto_ctc_menor_40: number | null;

  teor_baixo_menor_ctc_maior_igual_40: number | null;
  dose_teor_baixo_ctc_maior_igual_40: number | null;
  medio_menor_teor_ctc_maior_igual_40: number | null;
  medio_maior_teor_ctc_maior_igual_40: number | null;
  dose_teor_medio_ctc_maior_igual_40: number | null;
  adequado_menor_teor_ctc_maior_igual_40: number | null;
  adequado_maior_teor_ctc_maior_igual_40: number | null;
  dose_teor_adequado_ctc_maior_igual_40: number | null;
  teor_alto_maior_ctc_maior_igual_40: number | null;
  dose_teor_alto_ctc_maior_igual_40: number | null;

  observacoes?: string | null;
  fontes?: string | null;
}

export type PotassiumContentAndDoseCreateRequestDto = Omit<
  PotassiumContentAndDoseResponseDto,
  "id" | "id_tabela"
>;

export interface PotassiumContentAndDosePostRequestDto {
  [key: string]: number | string | undefined;
}
