export interface MicronutrientDoseResponseDto {
  id: number;
  id_tabela: number;

  boro_baixo_dose: number | null;
  boro_medio_dose: number | null;
  boro_alto_dose: number | null;

  cobre_baixo_dose: number | null;
  cobre_medio_dose: number | null;
  cobre_alto_dose: number | null;

  ferro_baixo_dose: number | null;
  ferro_medio_dose: number | null;
  ferro_alto_dose: number | null;

  manganes_baixo_dose: number | null;
  manganes_medio_dose: number | null;
  manganes_alto_dose: number | null;

  zinco_baixo_dose: number | null;
  zinco_medio_dose: number | null;
  zinco_alto_dose: number | null;

  observacoes?: string | null;
  fontes?: string | null;
}

export type MicronutrientDoseCreateRequestDto = Omit<MicronutrientDoseResponseDto, "id" | "id_tabela">;

export interface MicronutrientDosePostRequestDto {
  novo_boro_baixo_dose?: number;
  novo_boro_medio_dose?: number;
  novo_boro_alto_dose?: number;

  novo_cobre_baixo_dose?: number;
  novo_cobre_medio_dose?: number;
  novo_cobre_alto_dose?: number;

  novo_ferro_baixo_dose?: number;
  novo_ferro_medio_dose?: number;
  novo_ferro_alto_dose?: number;

  novo_manganes_baixo_dose?: number;
  novo_manganes_medio_dose?: number;
  novo_manganes_alto_dose?: number;

  novo_zinco_baixo_dose?: number;
  novo_zinco_medio_dose?: number;
  novo_zinco_alto_dose?: number;

  novo_observacoes?: string;
  novo_fontes?: string;
}
