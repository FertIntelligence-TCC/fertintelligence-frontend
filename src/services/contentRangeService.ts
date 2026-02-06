import { api } from "./axios";

// Interface para o Payload de Criação
export interface ContentRangeCreateRequest {
  nutriente: string;
  ordem_teor: number;
  menor_teor: number | null;
  maior_teor: number | null;
  aplicacao_recomendada_plantio: number | null;
}

// Interface de Resposta (snake_case do Java)
export interface ContentRangeResponseDto {
    id: number;
    id_tabela: number;
    nutriente: string;
    ordem_teor: number;
    menor_teor?: number;
    maior_teor?: number;
    aplicacao_recomendada_plantio?: number;
}

export const createContentRange = async (
  tableId: number,
  payload: ContentRangeCreateRequest
): Promise<ContentRangeResponseDto> => {
  const response = await api.post<ContentRangeResponseDto>(
    `/content-range/register`,
    payload,
    { params: { tableId } }
  );
  return response.data;
};

// NOVA FUNÇÃO: Buscar todas as faixas de uma tabela
export const fetchContentRangesByTable = async (tableId: number): Promise<ContentRangeResponseDto[]> => {
    const response = await api.get<ContentRangeResponseDto[]>(`/content-range/get-by-table`, {
        params: { tableId }
    });
    return response.data;
};