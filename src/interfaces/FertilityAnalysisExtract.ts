import { Camada } from "./LayerExtract";

export interface FertilityAnalysisExtractResponse {
    id: number;
    id_extrato_intervalo?: number;
    id_extrato_camada?: number;

    // Dados de visualização (achatados)
    profundidade_inicial?: number;
    profundidade_final?: number;
    camada?: Camada;
    subcamada?: number;

    // Dados Químicos (Mapeados dos @JsonProperty do DTO Java)
    ph_agua: number;
    ph_cacl2: number;
    calcio: number;
    magnesio: number;
    potassio: number;
    sodio: number;
    aluminio: number;
    aluminio_mais_hidrogenio: number;
    soma_bases: number;
    ctc_efetiva: number;
    ctc_ph7: number;
    saturacao_bases_v: number;
    saturacao_aluminio_m: number;
    pst: number;
    fosforo_mehlich1: number;
    fosforo_resina: number;
    enxofre: number;
    materia_organica: number;
    boro: number;
    cobre: number;
    ferro: number;
    manganes: number;
    zinco: number;
}

export interface FertilityAnalysisExtractCreatePayload {
    ph_agua?: number;
    ph_cacl2?: number;
    calcio?: number;
    magnesio?: number;
    potassio?: number;
    sodio?: number;
    aluminio?: number;
    aluminio_mais_hidrogenio?: number;
    soma_bases?: number;
    ctc_efetiva?: number;
    ctc_ph7?: number;
    saturacao_bases_v?: number;
    saturacao_aluminio_m?: number;
    pst?: number;
    fosforo_mehlich1?: number;
    fosforo_resina?: number;
    enxofre?: number;
    materia_organica?: number;
    boro?: number;
    cobre?: number;
    ferro?: number;
    manganes?: number;
    zinco?: number;
}

export interface FertilityAnalysisExtractUpdatePayload {
    novo_ph_agua?: number;
    novo_ph_cacl2?: number;
    novo_calcio?: number;
    novo_magnesio?: number;
    novo_potassio?: number;
    novo_sodio?: number;
    novo_aluminio?: number;
    novo_aluminio_mais_hidrogenio?: number;
    nova_soma_bases?: number;
    nova_ctc_efetiva?: number;
    nova_ctc_ph7?: number;
    nova_saturacao_bases_v?: number;
    nova_saturacao_aluminio_m?: number;
    novo_pst?: number;
    novo_fosforo_mehlich1?: number;
    novo_fosforo_resina?: number;
    novo_enxofre?: number;
    nova_materia_organica?: number;
    novo_boro?: number;
    novo_cobre?: number;
    novo_ferro?: number;
    novo_manganes?: number;
    novo_zinco?: number;
}
