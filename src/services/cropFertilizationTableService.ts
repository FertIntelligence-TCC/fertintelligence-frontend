// src/services/cropFertilizationTableService.ts
import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios"; // Assumindo que você já tem uma instância axios configurada
import { CropFertilizationTableCreateRequestDto, CropFertilizationTableResponseDto, CropFertilizationTemporaryLimingCriterionRequest, CropFertilizationTemporaryLimingCriterionResponse } from "../interfaces/CropFertilizationTable";


export const fetchCropFertilizationTables = async (): Promise<CropFertilizationTableResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_CROP_FERTILIZATION_TABLE_ALL, { params: { grupo: "MINHAS" } }); 
    return data;
};

const toCreatePayload = (payload: CropFertilizationTableCreateRequestDto) => {
    const { physicalAnalysisId, fertilityAnalysisId, ...rest } = payload;

    return {
        ...rest,
        id_analise_fisica: physicalAnalysisId ?? payload.id_analise_fisica ?? null,
        id_analise_fertilidade: fertilityAnalysisId ?? payload.id_analise_fertilidade ?? null,
    };
};

export const createCropFertilizationTable = async (payload: CropFertilizationTableCreateRequestDto): Promise<CropFertilizationTableResponseDto> => {
    const { data } = await api.post(ENDPOINT.CREATE_CROP_FERTILIZATION_TABLE, toCreatePayload(payload));
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
    novo_valor_maximo_espacamento_usado: payload.valor_maximo_espacamento_usado,
    novo_produtividade_regional: payload.produtividade_regional,
    novo_produtividade_esperada: payload.produtividade_esperada,
    novo_criterio_de_calagem: payload.criterio_de_calagem,
    propertyId: payload.propertyId,
    plotId: payload.plotId,
    id_analise_fisica: payload.physicalAnalysisId ?? payload.id_analise_fisica ?? null,
    id_analise_fertilidade: payload.fertilityAnalysisId ?? payload.id_analise_fertilidade ?? null,
    novo_tipo_de_esterco: payload.tipo_de_esterco,
    novo_quantidade_de_esterco: payload.quantidade_de_esterco,
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


export const calculateTemporaryLimingCriterion = async (payload: CropFertilizationTemporaryLimingCriterionRequest): Promise<CropFertilizationTemporaryLimingCriterionResponse> => {
    const { data } = await api.post(ENDPOINT.CALCULATE_CROP_FERTILIZATION_TABLE_TEMPORARY_LIMING_CRITERION, payload);
    return data;
};
