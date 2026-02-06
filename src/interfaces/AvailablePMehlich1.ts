// DTO de Resposta (GET) - Chaves em Português conforme o @JsonProperty do Java
export interface AvailablePMehlich1ResponseDto {
    id: number;
    id_tabela: number;

    // --- SOLO ARENOSO ---
    menor_teor_fosforo_solo_arenoso: number;
    teor_inicial_baixo_fosforo_solo_arenoso: number;
    teor_final_baixo_fosforo_solo_arenoso: number;
    teor_inicial_medio_fosforo_solo_arenoso: number;
    teor_final_medio_fosforo_solo_arenoso: number;
    teor_inicial_alto_fosforo_solo_arenoso: number;
    teor_final_alto_fosforo_solo_arenoso: number;
    maior_teor_fosforo_solo_arenoso: number;

    // --- SOLO MÉDIO (ARENOSO/ARGILOSO) ---
    menor_teor_fosforo_solo_arenoso_argiloso: number;
    teor_inicial_baixo_fosforo_solo_arenoso_argiloso: number;
    teor_final_baixo_fosforo_solo_arenoso_argiloso: number;
    teor_inicial_medio_fosforo_solo_arenoso_argiloso: number;
    teor_final_medio_fosforo_solo_arenoso_argiloso: number;
    teor_inicial_alto_fosforo_solo_arenoso_argiloso: number;
    teor_final_alto_fosforo_solo_arenoso_argiloso: number;
    maior_teor_fosforo_solo_arenoso_argiloso: number;

    // --- SOLO ARGILOSO ---
    menor_teor_fosforo_solo_argiloso: number;
    teor_inicial_baixo_fosforo_solo_argiloso: number;
    teor_final_baixo_fosforo_solo_argiloso: number;
    teor_inicial_medio_fosforo_solo_argiloso: number;
    teor_final_medio_fosforo_solo_argiloso: number;
    teor_inicial_alto_fosforo_solo_argiloso: number;
    teor_final_alto_fosforo_solo_argiloso: number;
    maior_teor_fosforo_solo_argiloso: number;

    // --- SOLO MUITO ARGILOSO ---
    menor_teor_fosforo_solo_muito_argiloso: number;
    teor_inicial_baixo_fosforo_solo_muito_argiloso: number;
    teor_final_baixo_fosforo_solo_muito_argiloso: number;
    teor_inicial_medio_fosforo_solo_muito_argiloso: number;
    teor_final_medio_fosforo_solo_muito_argiloso: number;
    teor_inicial_alto_fosforo_solo_muito_argiloso: number;
    teor_final_alto_fosforo_solo_muito_argiloso: number;
    maior_teor_fosforo_solo_muito_argiloso: number;
}

// DTO para Criação (POST) - Igual ao Response mas sem ID
export type AvailablePMehlich1CreateRequestDto = Omit<AvailablePMehlich1ResponseDto, 'id' | 'id_tabela'>;

// DTO para Atualização (PUT) - Chaves com prefixo "novo_"
export interface AvailablePMehlich1PostRequestDto {
    // --- SOLO ARENOSO ---
    novo_menor_teor_fosforo_solo_arenoso?: number;
    novo_teor_inicial_baixo_fosforo_solo_arenoso?: number;
    novo_teor_final_baixo_fosforo_solo_arenoso?: number;
    novo_teor_inicial_medio_fosforo_solo_arenoso?: number;
    novo_teor_final_medio_fosforo_solo_arenoso?: number;
    novo_teor_inicial_alto_fosforo_solo_arenoso?: number;
    novo_teor_final_alto_fosforo_solo_arenoso?: number;
    novo_maior_teor_fosforo_solo_arenoso?: number;

    // --- SOLO MÉDIO ---
    novo_menor_teor_fosforo_solo_arenoso_argiloso?: number;
    novo_teor_inicial_baixo_fosforo_solo_arenoso_argiloso?: number;
    novo_teor_final_baixo_fosforo_solo_arenoso_argiloso?: number;
    novo_teor_inicial_medio_fosforo_solo_arenoso_argiloso?: number;
    novo_teor_final_medio_fosforo_solo_arenoso_argiloso?: number;
    novo_teor_inicial_alto_fosforo_solo_arenoso_argiloso?: number;
    novo_teor_final_alto_fosforo_solo_arenoso_argiloso?: number;
    novo_maior_teor_fosforo_solo_arenoso_argiloso?: number;

    // --- SOLO ARGILOSO ---
    novo_menor_teor_fosforo_solo_argiloso?: number;
    novo_teor_inicial_baixo_fosforo_solo_argiloso?: number;
    novo_teor_final_baixo_fosforo_solo_argiloso?: number;
    novo_teor_inicial_medio_fosforo_solo_argiloso?: number;
    novo_teor_final_medio_fosforo_solo_argiloso?: number;
    novo_teor_inicial_alto_fosforo_solo_argiloso?: number;
    novo_teor_final_alto_fosforo_solo_argiloso?: number;
    novo_maior_teor_fosforo_solo_argiloso?: number;

    // --- SOLO MUITO ARGILOSO ---
    novo_menor_teor_fosforo_solo_muito_argiloso?: number;
    novo_teor_inicial_baixo_fosforo_solo_muito_argiloso?: number;
    novo_teor_final_baixo_fosforo_solo_muito_argiloso?: number;
    novo_teor_inicial_medio_fosforo_solo_muito_argiloso?: number;
    novo_teor_final_medio_fosforo_solo_muito_argiloso?: number;
    novo_teor_inicial_alto_fosforo_solo_muito_argiloso?: number;
    novo_teor_final_alto_fosforo_solo_muito_argiloso?: number;
    novo_maior_teor_fosforo_solo_muito_argiloso?: number;
}