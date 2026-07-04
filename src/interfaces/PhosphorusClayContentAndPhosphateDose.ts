export type PhosphorusClayContentAndPhosphateDoseSystem = "sequeiro" | "irrigado";

export type PhosphorusClayGroup =
  | "menor_teor_argila"
  | "primeiro_intervalo"
  | "segundo_intervalo"
  | "maior_teor_argila";

export type PhosphorusClayContentAndPhosphateDoseNumericField =
  | `menor_teor_argila_${PhosphorusClayContentAndPhosphateDoseSystem}`
  | `menor_teor_argila_primeiro_intervalo_${PhosphorusClayContentAndPhosphateDoseSystem}`
  | `maior_teor_argila_primeiro_intervalo_${PhosphorusClayContentAndPhosphateDoseSystem}`
  | `menor_teor_argila_segundo_intervalo_${PhosphorusClayContentAndPhosphateDoseSystem}`
  | `maior_teor_argila_segundo_intervalo_${PhosphorusClayContentAndPhosphateDoseSystem}`
  | `maior_teor_argila_${PhosphorusClayContentAndPhosphateDoseSystem}`
  | `dose_p2o5_teor_p_muito_baixo_${PhosphorusClayGroup}_${PhosphorusClayContentAndPhosphateDoseSystem}`
  | `dose_p2o5_teor_p_baixa_${PhosphorusClayGroup}_${PhosphorusClayContentAndPhosphateDoseSystem}`
  | `dose_p2o5_teor_p_media_${PhosphorusClayGroup}_${PhosphorusClayContentAndPhosphateDoseSystem}`;

export type PhosphorusClayContentAndPhosphateDoseCreateRequestDto = Record<
  PhosphorusClayContentAndPhosphateDoseNumericField,
  number
> & {
  observacoes?: string | null;
  fontes?: string | null;
};

export type PhosphorusClayContentAndPhosphateDoseResponseDto =
  PhosphorusClayContentAndPhosphateDoseCreateRequestDto & {
    id: number;
    id_tabela: number;
  };

export type PhosphorusClayContentAndPhosphateDosePostRequestDto = Partial<
  Record<`novo_${PhosphorusClayContentAndPhosphateDoseNumericField}`, number>
> & {
  novo_observacoes?: string;
  novo_fontes?: string;
};
