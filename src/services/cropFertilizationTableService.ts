// src/services/cropFertilizationTableService.ts
import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios"; // Assumindo que você já tem uma instância axios configurada
import { CropFertilizationTableCreateRequestDto, CropFertilizationTableResponseDto } from "../interfaces/CropFertilizationTable";


export const fetchCropFertilizationTables = async (): Promise<CropFertilizationTableResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_CROP_FERTILIZATION_TABLE_ALL, { params: { grupo: "MINHAS" } }); 
    return data;
};

export const createCropFertilizationTable = async (payload: CropFertilizationTableCreateRequestDto): Promise<CropFertilizationTableResponseDto> => {
    const { data } = await api.post(ENDPOINT.CREATE_CROP_FERTILIZATION_TABLE, payload);
    return data;
};

const toUpdatePayload = (payload: CropFertilizationTableCreateRequestDto) => ({
    novo_nome_comum_cultura: payload.nome_comum_cultura,
    novo_nome_cientifico_cultura: payload.nome_cientifico_cultura,
    novo_cultivares: payload.cultivares,
    novo_regioes_cultura: payload.regioes_cultura,
    novo_espacamentos_sugeridos: payload.espacamentos_sugeridos,
    novo_valor_inicial: payload.valor_inicial,
    novo_valor_final: payload.valor_final,
    novo_espacamento_usado: payload.espacamento_usado,
    novo_valor_espacamento_usado: payload.valor_espacamento_usado,
    novo_valor_inicial_espacamento_usado: payload.valor_inicial_espacamento_usado,
    novo_valor_final_espacamento_usado: payload.valor_final_espacamento_usado,
    novo_produtividade_regional: payload.produtividade_regional,
    novo_produtividade_esperada: payload.produtividade_esperada,
    propertyId: payload.propertyId,
    plotId: payload.plotId,
    physicalAnalysisId: payload.physicalAnalysisId,
    fertilityAnalysisId: payload.fertilityAnalysisId,
    novo_tipo_de_esterco: payload.tipo_de_esterco,
    novo_quantidade_de_esterco: payload.quantidade_de_esterco,
    novo_sugestao_gessagem: payload.sugestao_gessagem,
    novo_dose_minima_b: payload.dose_minima_b,
    novo_dose_maxima_b: payload.dose_maxima_b,
    novo_dose_minima_cu: payload.dose_minima_cu,
    novo_dose_maxima_cu: payload.dose_maxima_cu,
    novo_dose_minima_fe: payload.dose_minima_fe,
    novo_dose_maxima_fe: payload.dose_maxima_fe,
    novo_dose_minima_ni: payload.dose_minima_ni,
    novo_dose_maxima_ni: payload.dose_maxima_ni,
    novo_dose_minima_mn: payload.dose_minima_mn,
    novo_dose_maxima_mn: payload.dose_maxima_mn,
    novo_dose_minima_mo: payload.dose_minima_mo,
    novo_dose_maxima_mo: payload.dose_maxima_mo,
    novo_dose_minima_zn: payload.dose_minima_zn,
    novo_dose_maxima_zn: payload.dose_maxima_zn,
    novo_observacoes: payload.observacoes,
    novo_fontes: payload.fontes,
    tabela_publica: payload.tabela_publica,
});

export const updateCropFertilizationTable = async ({
    id,
    payload,
}: {
    id: number;
    payload: CropFertilizationTableCreateRequestDto;
}): Promise<CropFertilizationTableResponseDto> => {
    const { data } = await api.put(ENDPOINT.UPDATE_CROP_FERTILIZATION_TABLE, toUpdatePayload(payload), {
        params: { tableId: id },
    });
    return data;
};

export const deleteCropFertilizationTable = async (id: number): Promise<void> => {
    await api.delete(ENDPOINT.DELETE_CROP_FERTILIZATION_TABLE, { params: { tableId: id } });
};

export const fetchPublicCropFertilizationTables = async (): Promise<CropFertilizationTableResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_CROP_FERTILIZATION_TABLE_ALL_PUBLIC);
    return data;
};

export const fetchDefaultCropFertilizationTables = async (): Promise<CropFertilizationTableResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_CROP_FERTILIZATION_TABLE_ALL_DEFAULT);
    return data;
};
