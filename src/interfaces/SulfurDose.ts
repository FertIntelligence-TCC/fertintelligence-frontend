export interface SulfurDoseResponseDto {
  id: number;
  id_tabela: number;

  muito_baixo_dose_argila_menor_400: number | null;
  baixo_dose_argila_menor_400: number | null;
  medio_dose_argila_menor_400: number | null;
  alto_dose_argila_menor_400: number | null;
  muito_alto_dose_argila_menor_400: number | null;

  muito_baixo_dose_argila_maior_400: number | null;
  baixo_dose_argila_maior_400: number | null;
  medio_dose_argila_maior_400: number | null;
  alto_dose_argila_maior_400: number | null;
  muito_alto_dose_argila_maior_400: number | null;

  observacoes?: string | null;
  fontes?: string | null;
}

export type SulfurDoseCreateRequestDto = Omit<SulfurDoseResponseDto, "id" | "id_tabela">;

export interface SulfurDosePostRequestDto {
  novo_muito_baixo_dose_argila_menor_400?: number;
  novo_baixo_dose_argila_menor_400?: number;
  novo_medio_dose_argila_menor_400?: number;
  novo_alto_dose_argila_menor_400?: number;
  novo_muito_alto_dose_argila_menor_400?: number;

  novo_muito_baixo_dose_argila_maior_400?: number;
  novo_baixo_dose_argila_maior_400?: number;
  novo_medio_dose_argila_maior_400?: number;
  novo_alto_dose_argila_maior_400?: number;
  novo_muito_alto_dose_argila_maior_400?: number;

  novo_observacoes?: string;
  novo_fontes?: string;
}
