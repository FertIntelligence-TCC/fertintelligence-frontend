export interface AvailableSResponseDto {
    id: number;
    id_tabela: number;

    menor_teor_enxofre_argila_menor_400: number;
    teor_inicial_baixo_enxofre_argila_menor_400: number;
    teor_final_baixo_enxofre_argila_menor_400: number;
    teor_inicial_medio_enxofre_argila_menor_400: number;
    teor_final_medio_enxofre_argila_menor_400: number;
    teor_inicial_alto_enxofre_argila_menor_400: number;
    teor_final_alto_enxofre_argila_menor_400: number;
    maior_teor_enxofre_argila_menor_400: number;

    menor_teor_enxofre_argila_maior_400: number;
    teor_inicial_baixo_enxofre_argila_maior_400: number;
    teor_final_baixo_enxofre_argila_maior_400: number;
    teor_inicial_medio_enxofre_argila_maior_400: number;
    teor_final_medio_enxofre_argila_maior_400: number;
    teor_inicial_alto_enxofre_argila_maior_400: number;
    teor_final_alto_enxofre_argila_maior_400: number;
    maior_teor_enxofre_argila_maior_400: number;

    fonte_literatura?: string;
    observacoes?: string;
}

export type AvailableSCreateRequestDto = Omit<AvailableSResponseDto, 'id' | 'id_tabela'>;

export interface AvailableSPostRequestDto {
    [key: string]: number | string | undefined;
}
