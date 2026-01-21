// DTO de Resposta (GET) - Chaves em Português conforme os @JsonProperty do Java
export interface KExchangeableContentResponseDto {
    id: number;
    id_tabela: number;

    // --- CTC < 20 ---
    menor_teor_k_ctc_menor_20: number;
    teor_inicial_baixo_k_ctc_menor_20: number;
    teor_final_baixo_k_ctc_menor_20: number;
    teor_inicial_medio_k_ctc_menor_20: number;
    teor_final_medio_k_ctc_menor_20: number;
    teor_inicial_alto_k_ctc_menor_20: number;
    teor_final_alto_k_ctc_menor_20: number;
    maior_teor_k_ctc_menor_20: number;

    // --- CTC 20 - 40 ---
    menor_teor_k_ctc_20_40: number;
    teor_inicial_baixo_k_ctc_20_40: number;
    teor_final_baixo_k_ctc_20_40: number;
    teor_inicial_medio_k_ctc_20_40: number;
    teor_final_medio_k_ctc_20_40: number;
    teor_inicial_alto_k_ctc_20_40: number;
    teor_final_alto_k_ctc_20_40: number;
    maior_teor_k_ctc_20_40: number;

    // --- CTC 41 - 80 ---
    menor_teor_k_ctc_41_80: number;
    teor_inicial_baixo_k_ctc_41_80: number;
    teor_final_baixo_k_ctc_41_80: number;
    teor_inicial_medio_k_ctc_41_80: number;
    teor_final_medio_k_ctc_41_80: number;
    teor_inicial_alto_k_ctc_41_80: number;
    teor_final_alto_k_ctc_41_80: number;
    maior_teor_k_ctc_41_80: number;

    // --- CTC 81 - 120 ---
    menor_teor_k_ctc_81_120: number;
    teor_inicial_baixo_k_ctc_81_120: number;
    teor_final_baixo_k_ctc_81_120: number;
    teor_inicial_medio_k_ctc_81_120: number;
    teor_final_medio_k_ctc_81_120: number;
    teor_inicial_alto_k_ctc_81_120: number;
    teor_final_alto_k_ctc_81_120: number;
    maior_teor_k_ctc_81_120: number;

    // --- CTC > 120 ---
    menor_teor_k_ctc_maior_120: number;
    teor_inicial_baixo_k_ctc_maior_120: number;
    teor_final_baixo_k_ctc_maior_120: number;
    teor_inicial_medio_k_ctc_maior_120: number;
    teor_final_medio_k_ctc_maior_120: number;
    teor_inicial_alto_k_ctc_maior_120: number;
    teor_final_alto_k_ctc_maior_120: number;
    maior_teor_k_ctc_maior_120: number;
}

// DTO para Criação (POST) - Igual ao Response mas sem ID
export type KExchangeableContentCreateRequestDto = Omit<KExchangeableContentResponseDto, 'id' | 'id_tabela'>;

// DTO para Atualização (PUT) - Chaves com prefixo "novo_"
// Como são muitos campos, definimos como Record para flexibilidade, mas as chaves esperadas são "novo_" + chave original
export interface KExchangeableContentPostRequestDto {
    [key: string]: number;
}