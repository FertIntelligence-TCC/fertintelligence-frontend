import { api } from "./axios";
import { 
    FoliarTableResponseDto, 
    FoliarTableCreateRequestDto, 
    FoliarTablePostRequestDto
} from "@/interfaces/FoliarAnalysisInterpretationTable";

const TABLE_ENDPOINT = "/crop-foliar-analysis-interpretation-table"; 
const LINE_ENDPOINT = "/crop-foliar-analysis-interpretation-table-line"; 

// --- TABELAS ---

export const fetchFoliarTables = async (): Promise<FoliarTableResponseDto[]> => {
    const { data } = await api.get(`${TABLE_ENDPOINT}/get-all`, { params: { grupo: "PRIVADAS" } });
    return data;
};

export const createFoliarTable = async (payload: FoliarTableCreateRequestDto): Promise<FoliarTableResponseDto> => {
    const { data } = await api.post(`${TABLE_ENDPOINT}/register`, payload);
    return data;
};

export const updateFoliarTable = async (id: number, payload: FoliarTablePostRequestDto): Promise<FoliarTableResponseDto> => {
    const { data } = await api.put(`${TABLE_ENDPOINT}/update`, payload, { params: { tableId: id } });
    return data;
};

export const deleteFoliarTable = async (id: number): Promise<void> => {
    await api.delete(`${TABLE_ENDPOINT}/delete`, { params: { tableId: id } });
};

// --- LINHAS (Novo) ---

// Busca todas as linhas de uma tabela específica
export const fetchLinesByTable = async (tableId: number): Promise<any[]> => { // Retorna DTOs de Linha (backend response)
    const { data } = await api.get(`${LINE_ENDPOINT}/get-by-table`, { params: { tableId } });
    return data;
};

// Cria uma linha individual
export const createFoliarTableLine = async (tableId: number, payload: any): Promise<void> => {
    await api.post(`${LINE_ENDPOINT}/register`, payload, { params: { tableId } });
};

// Deleta uma linha
export const deleteFoliarTableLine = async (lineId: number): Promise<void> => {
    await api.delete(`${LINE_ENDPOINT}/delete`, { params: { lineId } });
};

export const fetchPublicFoliarTables = async (): Promise<FoliarTableResponseDto[]> => {
    const { data } = await api.get(`${TABLE_ENDPOINT}/get-all-public`);
    return data;
};

export const fetchDefaultFoliarTables = async (): Promise<FoliarTableResponseDto[]> => {
    const { data } = await api.get(`${TABLE_ENDPOINT}/get-all-default`);
    return data;
};
