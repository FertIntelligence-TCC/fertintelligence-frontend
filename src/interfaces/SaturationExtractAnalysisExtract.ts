import { Camada } from "./LayerExtract";

export interface SaturationExtractAnalysisExtractResponse {
    id: number;
    id_extrato_intervalo?: number;
    id_extrato_camada?: number;

    // Dados de visualização (achatados)
    profundidade_inicial?: number;
    profundidade_final?: number;
    camada?: Camada;
    subcamada?: number;

    // Parâmetros Químicos da Saturação
    ph: number;
    ce: number; // Condutividade Elétrica
    
    // Anions
    teor_co3: number;
    teor_hco3: number;
    teor_no3: number;
    teor_h2po4: number;
    teor_so4: number;
    teor_cl?: number;
    
    // Cations
    teor_na: number;
    teor_k: number;
    teor_ca: number;
    teor_mg: number;
    
    // Outros
    residuos_suspensao: number;
    dureza_caco3: number;
    dureza_total_caco3: number;
    ras: number; // Razão de Adsorção de Sódio
}

export interface SaturationExtractAnalysisExtractCreatePayload {
    ph?: number;
    ce?: number;
    teor_co3?: number;
    teor_hco3?: number;
    teor_no3?: number;
    teor_h2po4?: number;
    teor_so4?: number;
    teor_cl?: number;
    teor_na?: number;
    teor_k?: number;
    teor_ca?: number;
    teor_mg?: number;
    residuos_suspensao?: number;
    dureza_caco3?: number;
    dureza_total_caco3?: number;
    ras?: number;
}

export interface SaturationExtractAnalysisExtractUpdatePayload {
    novo_ph?: number;
    novo_ce?: number;
    
    // Note os prefixos "novo_" mapeados do PostRequestDto
    novo_teor_co3?: number;
    novo_teor_hco3?: number;
    novo_teor_no3?: number;
    novo_teor_h2po4?: number;
    novo_teor_so4?: number;
    novo_teor_cl?: number;
    novo_teor_na?: number;
    novo_teor_k?: number;
    novo_teor_ca?: number;
    novo_teor_mg?: number;
    
    // Atenção: no DTO Java está "novos_residuos_suspensao" (plural)
    novos_residuos_suspensao?: number;
    
    nova_dureza_caco3?: number;
    nova_dureza_total_caco3?: number;
    novo_ras?: number;
}
