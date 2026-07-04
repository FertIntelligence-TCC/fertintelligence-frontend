export interface CorrectiveP2O5FertilizationResponseDto {
  id: number;
  id_tabela: number;
  nome_exibicao?: string | null;
  unidade_argila?: string | null;
  unidade_p_mehlich?: string | null;
  unidade_dose?: string | null;
  argila_minima: number | null;
  argila_maxima: number | null;
  p_mehlich_minimo: number | null;
  p_mehlich_maximo: number | null;
  dose_p2o5: number | null;
  observacoes?: string | null;
  fontes?: string | null;
}

export interface CorrectiveP2O5FertilizationCreateRequestDto {
  argila_minima: number | null;
  argila_maxima: number | null;
  p_mehlich_minimo: number | null;
  p_mehlich_maximo: number | null;
  dose_p2o5: number;
  observacoes?: string | null;
  fontes?: string | null;
}

export interface CorrectiveP2O5FertilizationPostRequestDto {
  nova_argila_minima?: number | null;
  nova_argila_maxima?: number | null;
  novo_p_mehlich_minimo?: number | null;
  novo_p_mehlich_maximo?: number | null;
  nova_dose_p2o5?: number;
  novo_observacoes?: string | null;
  novo_fontes?: string | null;
}
