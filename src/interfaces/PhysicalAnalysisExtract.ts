import { Camada } from "./LayerExtract";

export interface PhysicalAnalysisExtractResponse {
    id: number;
    id_extrato_intervalo?: number;
    id_extrato_camada?: number;
    
    // Dados de visualização (achatados do extrato pai)
    profundidade_inicial?: number;
    profundidade_final?: number;
    camada?: Camada;
    subcamada?: number;

    // Dados Físicos
    teor_areia: number;
    teor_silte: number;
    teor_argila: number;
    densidade_aparente: number;
    densidade_real: number;
    porosidade_total: number;
    microporosidade: number;
    umidade_capacidade_campo: number;
    umidade_ponto_murcha_permanente: number;
    agua_disponivel: number;
    resistencia_penetracao: number;
    
    // Agregados
    perc_agregados_6_0mm: number;
    perc_agregados_4_1_a_6_0mm: number;
    perc_agregados_2_1_a_4_0mm: number;
    perc_agregados_1_0_a_2_0mm?: number;
    perc_agregados_0_5_a_1_0mm?: number;
    perc_agregados_0_25_a_0_5mm?: number;
    perc_agregados_menor_0_25mm?: number;
    dm_agregados?: number;
}

export interface PhysicalAnalysisExtractCreatePayload {
    teor_areia: number;
    teor_silte: number;
    teor_argila: number;
    densidade_aparente: number;
    densidade_real: number;
    porosidade_total: number;
    microporosidade: number;
    umidade_capacidade_campo: number;
    umidade_ponto_murcha_permanente: number;
    agua_disponivel: number;
    resistencia_penetracao: number;
    perc_agregados_6_0mm: number;
    perc_agregados_4_1_a_6_0mm: number;
    perc_agregados_2_1_a_4_0mm: number;
    perc_agregados_1_0_a_2_0mm?: number;
    perc_agregados_0_5_a_1_0mm?: number;
    perc_agregados_0_25_a_0_5mm?: number;
    perc_agregados_menor_0_25mm?: number;
    dm_agregados?: number;
}

export interface PhysicalAnalysisExtractUpdatePayload {
    novo_teor_areia?: number;
    novo_teor_silte?: number;
    novo_teor_argila?: number;
    nova_densidade_aparente?: number;
    nova_densidade_real?: number;
    nova_porosidade_total?: number;
    nova_microporosidade?: number;
    nova_umidade_capacidade_campo?: number;
    nova_umidade_ponto_murcha_permanente?: number;
    nova_agua_disponivel?: number;
    nova_resistencia_penetracao?: number;
    novo_perc_agregados_6_0mm?: number;
    novo_perc_agregados_4_1_a_6_0mm?: number;
    novo_perc_agregados_2_1_a_4_0mm?: number;
    novo_perc_agregados_1_0_a_2_0mm?: number;
    novo_perc_agregados_0_5_a_1_0mm?: number;
    novo_perc_agregados_0_25_a_0_5mm?: number;
    novo_perc_agregados_menor_0_25mm?: number;
    novo_dm_agregados?: number;
}
