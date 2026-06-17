// DTO de Resposta (GET) - Chaves em Português conforme os @JsonProperty do Java
export interface DiverseContentRangeResponseDto {
    id: number;
    id_tabela: number;
    [key: string]: number; // Assinatura de índice para acesso dinâmico seguro
}

// Lista de Sufixos (usada para tipagem e iteração)
export type NutrientSuffix = 
    | "aluminio" | "aluminio_mais_hidrogenio" | "ctc_efetiva" | "ctc_ph7"
    | "ph_agua" | "ph_cacl2" | "carbono_organico" | "materia_organica" | "calcio" | "magnesio"
    | "potassio" | "sodio" | "soma_bases" | "pst"
    | "saturacao_aluminio" | "saturacao_bases" | "boro" | "cobre"
    | "ferro" | "manganes" | "zinco";

// DTO para Criação (POST) - Chaves em Português
export interface DiverseContentRangeCreateRequestDto {
    [key: string]: number;
}

// DTO para Atualização (PUT) - Chaves com prefixo "novo_"
export interface DiverseContentRangePostRequestDto {
    [key: string]: number;
}
