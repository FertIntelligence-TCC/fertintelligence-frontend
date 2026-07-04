export interface CorrectiveK2OFertilizationResponseDto {
  id: number;
  id_tabela: number;
  nome_exibicao?: string | null;
  unidade_ctc?: string | null;
  unidade_k?: string | null;
  unidade_dose?: string | null;
  ctc_minima: number | null;
  ctc_maxima: number | null;
  k_minimo: number | null;
  k_maximo: number | null;
  dose_k2o: number | null;
  observacoes?: string | null;
  fontes?: string | null;
}

export interface CorrectiveK2OFertilizationCreateRequestDto {
  ctc_minima: number | null;
  ctc_maxima: number | null;
  k_minimo: number | null;
  k_maximo: number | null;
  dose_k2o: number;
  observacoes?: string | null;
  fontes?: string | null;
}

export interface CorrectiveK2OFertilizationPostRequestDto {
  nova_ctc_minima?: number | null;
  nova_ctc_maxima?: number | null;
  novo_k_minimo?: number | null;
  novo_k_maximo?: number | null;
  nova_dose_k2o?: number;
  novo_observacoes?: string | null;
  novo_fontes?: string | null;
}
