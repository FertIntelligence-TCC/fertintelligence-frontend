export interface AvailablePResinResponseDto {
    id: number;
    id_tabela: number;
    unidade: string;
    muito_baixo: number;
    baixo_menor: number;
    baixo_maior: number;
    medio_menor: number;
    medio_maior: number;
    alto_menor: number;
    alto_maior: number;
    muito_alto: number;
    observacoes?: string | null;
    fontes?: string | null;
}

export type AvailablePResinCreateRequestDto = Omit<AvailablePResinResponseDto, 'id' | 'id_tabela' | 'unidade'>;

export interface AvailablePResinPostRequestDto {
    novo_muito_baixo?: number;
    novo_baixo_menor?: number;
    novo_baixo_maior?: number;
    novo_medio_menor?: number;
    novo_medio_maior?: number;
    novo_alto_menor?: number;
    novo_alto_maior?: number;
    novo_muito_alto?: number;
    novo_observacoes?: string;
    novo_fontes?: string;
}
