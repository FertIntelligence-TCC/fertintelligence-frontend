export enum Camada {
    O = "O",
    A = "A",
    B = "B",
    E = "E",
    C = "C"
}

export interface LayerExtractResponse {
    id: number;
    profundidade_inicial: number;
    profundidade_final: number;
    camada: Camada;
    subcamada: number;
    id_analise: number;
    ano_analise: number;
    laboratorio_responsavel: string;
}

export interface LayerExtractCreatePayload {
    profundidade_inicial: number;
    profundidade_final: number;
    camada: Camada;
    subcamada: number;
}

export interface LayerExtractUpdatePayload {
    nova_profundidade_inicial?: number;
    nova_profundidade_final?: number;
    nova_camada?: Camada;
    nova_subcamada?: number;
}