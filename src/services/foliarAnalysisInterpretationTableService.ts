import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import { 
    FoliarTableResponseDto, 
    FoliarTableCreateRequestDto, 
    FoliarTablePostRequestDto
} from "@/interfaces/FoliarAnalysisInterpretationTable";



// --- TABELAS ---

export const fetchFoliarTables = async (): Promise<FoliarTableResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE, { params: { grupo: "MINHAS" } });
    return data;
};

export const createFoliarTable = async (payload: FoliarTableCreateRequestDto): Promise<FoliarTableResponseDto> => {
    const { data } = await api.post(ENDPOINT.CREATE_CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE, payload);
    return data;
};

export const updateFoliarTable = async (id: number, payload: FoliarTablePostRequestDto): Promise<FoliarTableResponseDto> => {
    const { data } = await api.put(ENDPOINT.UPDATE_CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE, payload, { params: { tableId: id } });
    return data;
};

export const deleteFoliarTable = async (id: number): Promise<void> => {
    await api.delete(ENDPOINT.DELETE_CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE, { params: { tableId: id } });
};

// --- LINHAS (Novo) ---

// Busca todas as linhas de uma tabela específica
export const fetchLinesByTable = async (tableId: number): Promise<any[]> => { // Retorna DTOs de Linha (backend response)
    const { data } = await api.get(ENDPOINT.GET_BY_TABLE_CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE_LINE, { params: { tableId } });
    return data;
};

// Cria uma linha individual
export const createFoliarTableLine = async (tableId: number, payload: any): Promise<void> => {
    await api.post(ENDPOINT.CREATE_CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE_LINE, payload, { params: { tableId } });
};

// Deleta uma linha
export const deleteFoliarTableLine = async (lineId: number): Promise<void> => {
    await api.delete(ENDPOINT.DELETE_CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE_LINE, { params: { lineId } });
};

export const fetchPublicFoliarTables = async (): Promise<FoliarTableResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_PUBLIC_CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE);
    return data;
};

export const fetchDefaultFoliarTables = async (): Promise<FoliarTableResponseDto[]> => {
    const { data } = await api.get(ENDPOINT.GET_ALL_DEFAULT_CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE);
    return data;
};
