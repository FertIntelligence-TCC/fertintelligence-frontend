// src/services/cropFertilizationTableService.ts
import { api } from "./axios"; // Assumindo que você já tem uma instância axios configurada
import { CropFertilizationTableCreateRequestDto, CropFertilizationTableResponseDto } from "../interfaces/CropFertilizationTable";

const ENDPOINT = "/crop-fertilization-table"; 

export const fetchCropFertilizationTables = async (): Promise<CropFertilizationTableResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all`, { params: { grupo: "MINHAS" } }); 
    return data;
};

export const createCropFertilizationTable = async (payload: CropFertilizationTableCreateRequestDto): Promise<CropFertilizationTableResponseDto> => {
    const { data } = await api.post(`${ENDPOINT}/register`, payload);
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
    novo_produtividade_regional: payload.produtividade_regional,
    novo_produtividade_esperada: payload.produtividade_esperada,
    novo_criterio_de_calagem: payload.criterio_de_calagem,
    novo_tipo_de_esterco: payload.tipo_de_esterco,
    novo_quantidade_de_esterco: payload.quantidade_de_esterco,
    novo_sugestao_gessagem: payload.sugestao_gessagem,
    novo_sugestao_micronutrientes: payload.sugestao_micronutrientes,
    novo_sugestao_npk: payload.sugestao_npk,
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
    const { data } = await api.put(`${ENDPOINT}/update`, toUpdatePayload(payload), {
        params: { tableId: id },
    });
    return data;
};

export const deleteCropFertilizationTable = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/delete`, { params: { tableId: id } });
};

export const fetchPublicCropFertilizationTables = async (): Promise<CropFertilizationTableResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all-public`);
    return data;
};

export const fetchDefaultCropFertilizationTables = async (): Promise<CropFertilizationTableResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT}/get-all-default`);
    return data;
};
