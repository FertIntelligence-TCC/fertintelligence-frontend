export interface ExchangeableSodiumResponseDto {
  id: number;
  id_tabela: number;
  menor_teor_sodio_ctc_menor_4_3: number;
  teor_inicial_baixo_sodio_ctc_menor_4_3: number;
  teor_final_baixo_sodio_ctc_menor_4_3: number;
  teor_inicial_medio_sodio_ctc_menor_4_3: number;
  teor_final_medio_sodio_ctc_menor_4_3: number;
  teor_inicial_alto_sodio_ctc_menor_4_3: number;
  teor_final_alto_sodio_ctc_menor_4_3: number;
  maior_teor_sodio_ctc_menor_4_3: number;

  menor_teor_sodio_ctc_4_3_a_8_6: number;
  teor_inicial_baixo_sodio_ctc_4_3_a_8_6: number;
  teor_final_baixo_sodio_ctc_4_3_a_8_6: number;
  teor_inicial_medio_sodio_ctc_4_3_a_8_6: number;
  teor_final_medio_sodio_ctc_4_3_a_8_6: number;
  teor_inicial_alto_sodio_ctc_4_3_a_8_6: number;
  teor_final_alto_sodio_ctc_4_3_a_8_6: number;
  maior_teor_sodio_ctc_4_3_a_8_6: number;

  menor_teor_sodio_ctc_8_7_a_15_0: number;
  teor_inicial_baixo_sodio_ctc_8_7_a_15_0: number;
  teor_final_baixo_sodio_ctc_8_7_a_15_0: number;
  teor_inicial_medio_sodio_ctc_8_7_a_15_0: number;
  teor_final_medio_sodio_ctc_8_7_a_15_0: number;
  teor_inicial_alto_sodio_ctc_8_7_a_15_0: number;
  teor_final_alto_sodio_ctc_8_7_a_15_0: number;
  maior_teor_sodio_ctc_8_7_a_15_0: number;

  menor_teor_sodio_ctc_maior_15: number;
  teor_inicial_baixo_sodio_ctc_maior_15: number;
  teor_final_baixo_sodio_ctc_maior_15: number;
  teor_inicial_medio_sodio_ctc_maior_15: number;
  teor_final_medio_sodio_ctc_maior_15: number;
  teor_inicial_alto_sodio_ctc_maior_15: number;
  teor_final_alto_sodio_ctc_maior_15: number;
  maior_teor_sodio_ctc_maior_15: number;
}

export type ExchangeableSodiumCreateRequestDto = Omit<ExchangeableSodiumResponseDto, 'id' | 'id_tabela'>;

export type ExchangeableSodiumPostRequestDto = {
  [K in keyof ExchangeableSodiumCreateRequestDto as `novo_${K & string}`]?: number;
};
