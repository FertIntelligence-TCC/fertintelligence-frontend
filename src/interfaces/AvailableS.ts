// DTO de Resposta (GET) - Chaves em Português
export interface AvailableSResponseDto {
    id: number;
    id_tabela: number;

    // --- SOLO ARENOSO ---
    menor_teor_enxofre_solo_arenoso: number;
    teor_inicial_baixo_enxofre_solo_arenoso: number;
    teor_final_baixo_enxofre_solo_arenoso: number;
    teor_inicial_medio_enxofre_solo_arenoso: number;
    teor_final_medio_enxofre_solo_arenoso: number;
    teor_inicial_alto_enxofre_solo_arenoso: number;
    teor_final_alto_enxofre_solo_arenoso: number;
    maior_teor_enxofre_solo_arenoso: number;

    // --- SOLO MÉDIO (ARENOSO/ARGILOSO) ---
    menor_teor_enxofre_solo_arenoso_argiloso: number;
    teor_inicial_baixo_enxofre_solo_arenoso_argiloso: number;
    teor_final_baixo_enxofre_solo_arenoso_argiloso: number;
    teor_inicial_medio_enxofre_solo_arenoso_argiloso: number;
    teor_final_medio_enxofre_solo_arenoso_argiloso: number;
    teor_inicial_alto_enxofre_solo_arenoso_argiloso: number;
    teor_final_alto_enxofre_solo_arenoso_argiloso: number;
    maior_teor_enxofre_solo_arenoso_argiloso: number;

    // --- SOLO ARGILOSO ---
    menor_teor_enxofre_solo_argiloso: number;
    teor_inicial_baixo_enxofre_solo_argiloso: number;
    teor_final_baixo_enxofre_solo_argiloso: number;
    teor_inicial_medio_enxofre_solo_argiloso: number;
    teor_final_medio_enxofre_solo_argiloso: number;
    teor_inicial_alto_enxofre_solo_argiloso: number;
    teor_final_alto_enxofre_solo_argiloso: number;
    maior_teor_enxofre_solo_argiloso: number;

    // --- SOLO MUITO ARGILOSO ---
    menor_teor_enxofre_solo_muito_argiloso: number;
    teor_inicial_baixo_enxofre_solo_muito_argiloso: number;
    teor_final_baixo_enxofre_solo_muito_argiloso: number;
    teor_inicial_medio_enxofre_solo_muito_argiloso: number;
    teor_final_medio_enxofre_solo_muito_argiloso: number;
    teor_inicial_alto_enxofre_solo_muito_argiloso: number;
    teor_final_alto_enxofre_solo_muito_argiloso: number;
    maior_teor_enxofre_solo_muito_argiloso: number;
}

// DTO para Criação (POST) - Igual ao Response mas sem ID
export type AvailableSCreateRequestDto = Omit<AvailableSResponseDto, 'id' | 'id_tabela'>;

// DTO para Atualização (PUT) - Chaves com prefixo "novo_"
export interface AvailableSPostRequestDto {
    // --- SOLO ARENOSO ---
    novo_menor_teor_enxofre_solo_arenoso?: number;
    novo_teor_inicial_baixo_enxofre_solo_arenoso?: number;
    novo_teor_final_baixo_enxofre_solo_arenoso?: number;
    novo_teor_inicial_medio_enxofre_solo_arenoso?: number;
    novo_teor_final_medio_enxofre_solo_arenoso?: number;
    novo_teor_inicial_alto_enxofre_solo_arenoso?: number;
    novo_teor_final_alto_enxofre_solo_arenoso?: number;
    novo_maior_teor_enxofre_solo_arenoso?: number;

    // --- SOLO MÉDIO ---
    novo_menor_teor_enxofre_solo_arenoso_argiloso?: number;
    novo_teor_inicial_baixo_enxofre_solo_arenoso_argiloso?: number;
    novo_teor_final_baixo_enxofre_solo_arenoso_argiloso?: number;
    novo_teor_inicial_medio_enxofre_solo_arenoso_argiloso?: number;
    novo_teor_final_medio_enxofre_solo_arenoso_argiloso?: number;
    novo_teor_inicial_alto_enxofre_solo_arenoso_argiloso?: number;
    novo_teor_final_alto_enxofre_solo_arenoso_argiloso?: number;
    novo_maior_teor_enxofre_solo_arenoso_argiloso?: number;

    // --- SOLO ARGILOSO ---
    novo_menor_teor_enxofre_solo_argiloso?: number;
    novo_teor_inicial_baixo_enxofre_solo_argiloso?: number;
    novo_teor_final_baixo_enxofre_solo_argiloso?: number;
    novo_teor_inicial_medio_enxofre_solo_argiloso?: number;
    novo_teor_final_medio_enxofre_solo_argiloso?: number;
    novo_teor_inicial_alto_enxofre_solo_argiloso?: number;
    novo_teor_final_alto_enxofre_solo_argiloso?: number;
    novo_maior_teor_enxofre_solo_argiloso?: number;

    // --- SOLO MUITO ARGILOSO ---
    novo_menor_teor_enxofre_solo_muito_argiloso?: number;
    novo_teor_inicial_baixo_enxofre_solo_muito_argiloso?: number;
    novo_teor_final_baixo_enxofre_solo_muito_argiloso?: number;
    novo_teor_inicial_medio_enxofre_solo_muito_argiloso?: number;
    novo_teor_final_medio_enxofre_solo_muito_argiloso?: number;
    novo_teor_inicial_alto_enxofre_solo_muito_argiloso?: number;
    novo_teor_final_alto_enxofre_solo_muito_argiloso?: number;
    novo_maior_teor_enxofre_solo_muito_argiloso?: number;
}