export interface KExchangeableContentResponseDto {
id: number;
id_tabela: number;


menor_teor_k: number;
teor_inicial_baixo_k: number;
teor_final_baixo_k: number;

teor_inicial_medio_k: number;
teor_final_medio_k: number;

teor_inicial_alto_k: number;
teor_final_alto_k: number;

maior_teor_k: number;


observacoes?: string | null;
fontes?: string | null;

}

export type KExchangeableContentCreateRequestDto =
Omit<KExchangeableContentResponseDto, 'id' | 'id_tabela'>;

export interface KExchangeableContentPostRequestDto {
[key: string]: number | string | undefined;
}
