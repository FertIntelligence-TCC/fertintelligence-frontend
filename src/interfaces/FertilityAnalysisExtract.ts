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
    pst?: number;
    saturacao_potassio_ctc?: number | null;
    saturacao_sodio_ctc?: number | null;
    saturacao_calcio_ctc?: number | null;
    saturacao_magnesio_ctc?: number | null;
    saturacao_hidrogenio_ctc?: number | null;
    saturacao_aluminio_ctc?: number | null;
    relacao_calcio_magnesio?: number | null;
    relacao_calcio_potassio?: number | null;
    relacao_magnesio_potassio?: number | null;
    relacao_calcio_magnesio_potassio?: number | null;
    fosforo_mehlich1: number;
    fosforo_resina: number;
    enxofre: number;
    materia_organica: number;
    boro: number | null;
    cobre: number | null;
    ferro: number | null;
    manganes: number | null;
    zinco: number | null;
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
    boro?: number | null;
    cobre?: number | null;
    ferro?: number | null;
    manganes?: number | null;
    zinco?: number | null;
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
    novo_boro?: number | null;
    novo_cobre?: number | null;
    novo_ferro?: number | null;
    novo_manganes?: number | null;
    novo_zinco?: number | null;
}
