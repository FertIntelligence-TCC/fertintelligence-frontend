import { api } from "./axios";
import { ENDPOINT } from "@/constants/Endpoint";
import {
    FoliarTableResponseDto,
    FoliarTableCreateRequestDto,
    FoliarTablePostRequestDto
} from "@/interfaces/FoliarAnalysisInterpretationTable";


// --- TABELAS ---

export const fetchFoliarTables = async (): Promise<FoliarTableResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE}/get-all`, { params: { grupo: "MINHAS" } });
    return data;
};

export const createFoliarTable = async (payload: FoliarTableCreateRequestDto): Promise<FoliarTableResponseDto> => {
    const { data } = await api.post(`${ENDPOINT.CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE}/register`, payload);
    return data;
};

export const updateFoliarTable = async (id: number, payload: FoliarTablePostRequestDto): Promise<FoliarTableResponseDto> => {
    const { data } = await api.put(`${ENDPOINT.CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE}/update`, payload, { params: { tableId: id } });
    return data;
};

export const deleteFoliarTable = async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT.CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE}/delete`, { params: { tableId: id } });
};

// --- LINHAS (Novo) ---

// Busca todas as linhas de uma tabela específica
export const fetchLinesByTable = async (tableId: number): Promise<any[]> => { // Retorna DTOs de Linha (backend response)
    const { data } = await api.get(`${ENDPOINT.CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE_LINE}/get-by-table`, { params: { tableId } });
    return data;
};

// Cria uma linha individual
export const createFoliarTableLine = async (tableId: number, payload: any): Promise<void> => {
    await api.post(`${ENDPOINT.CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE_LINE}/register`, payload, { params: { tableId } });
};

// Deleta uma linha
export const deleteFoliarTableLine = async (lineId: number): Promise<void> => {
    await api.delete(`${ENDPOINT.CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE_LINE}/delete`, { params: { lineId } });
};

export const fetchPublicFoliarTables = async (): Promise<FoliarTableResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE}/get-all-public`);
    return data;
};

export const fetchDefaultFoliarTables = async (): Promise<FoliarTableResponseDto[]> => {
    const { data } = await api.get(`${ENDPOINT.CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE}/get-all-default`);
    return data;
};
