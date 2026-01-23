export interface RangeExtractResponse {
    id: number;
    profundidade_inicial: number;
    profundidade_final: number;
    id_analise: number;
    ano_analise: number;
    laboratorio_responsavel: string;
}

export interface RangeExtractCreatePayload {
    profundidade_inicial: number;
    profundidade_final: number;
}

export interface RangeExtractUpdatePayload {
    nova_profundidade_inicial?: number;
    nova_profundidade_final?: number;
}