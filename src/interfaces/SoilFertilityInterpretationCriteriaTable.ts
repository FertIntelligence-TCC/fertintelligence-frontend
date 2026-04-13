export enum RegionEnum {
    NORDESTE = "NORDESTE",
    CENTRO_OESTE = "CENTRO_OESTE",
    SUL = "SUL"
}

export interface SoilFertilityTableResponseDto {
    id: number;
    nome_criterios: string;
    descricao_criterios?: string;
    regiao: RegionEnum;
    nome_criador?: string;
    nome_comum_cultura?: string;
    cultivares?: string;
    tabela_publica?: boolean;
    // As tabelas auxiliares seriam carregadas aqui em uma implementação real,
    // mas visualmente representaremos os retângulos fixos conforme solicitado.
}

export interface SoilFertilityTableCreateRequestDto {
    nome_criterios: string;
    regiao: RegionEnum;
    tabela_publica?: boolean;
}

export interface SoilFertilityTablePostRequestDto {
    novo_nome_criterios?: string;
    nova_descricao_criterios?: string;
    nova_regiao?: RegionEnum;
    tabela_publica?: boolean;
}

export interface SoilFertilityFormState {
    nome: string;
    descricao: string;
    regiao: string;
    tabelaPublica: boolean;
}

export const DEFAULT_SOIL_FERTILITY_STATE: SoilFertilityFormState = {
    nome: "",
    descricao: "",
    regiao: "",
    tabelaPublica: false
};