// DTO de Resposta (GET) - Chaves em Inglês
export interface AvailablePResinResponseDto {
    id: number;
    id_tabela: number;
    [key: string]: number; // Assinatura de índice para acesso dinâmico seguro
}

// Helper type para os campos de uma cultura específica (usado no loop de geração)
export type CropFieldSuffix = 
    | "cotton" | "peanut" | "sugar_cane" | "cowpea" | "common_bean" 
    | "sesame" | "castor_bean" | "corn" | "sisal" | "soybean";

// DTO para Criação (POST) - Chaves em Português
export interface AvailablePResinCreateRequestDto {
    [key: string]: number;
}

// DTO para Atualização (PUT) - Chaves com prefixo "novo_"
export interface AvailablePResinPostRequestDto {
    [key: string]: number;
}