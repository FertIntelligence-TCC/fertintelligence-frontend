export enum TipoExtrato {
    CAMADAS = "CAMADAS",
    INTERVALOS = "INTERVALOS"
}

export interface SoilAnalysisResponse {
    id: number;
    ano_analise: number;
    laboratorio_responsavel: string;
    tipo_extrato: TipoExtrato;
    id_talhao: number;
    identificacao_talhao: string;
}

export interface SoilAnalysisCreatePayload {
    ano_analise: number;
    laboratorio_responsavel: string;
    tipo_extrato: TipoExtrato;
    id_talhao: number;
    identificacao_talhao: string;
}

export interface SoilAnalysisUpdatePayload {
    novo_ano_analise?: number;
    novo_laboratorio_responsavel?: string;
    novo_tipo_extrato?: TipoExtrato;
}