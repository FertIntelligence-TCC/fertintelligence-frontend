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
    // As tabelas auxiliares seriam carregadas aqui em uma implementação real,
    // mas visualmente representaremos os retângulos fixos conforme solicitado.
}

export interface SoilFertilityTableCreateRequestDto {
    nome_criterios: string;
    regiao: RegionEnum;
}

export interface SoilFertilityTablePostRequestDto {
    novo_nome_criterios?: string;
    nova_descricao_criterios?: string;
    nova_regiao?: RegionEnum;
}

export interface SoilFertilityFormState {
    nome: string;
    descricao: string;
    regiao: string;
}

export const DEFAULT_SOIL_FERTILITY_STATE: SoilFertilityFormState = {
    nome: "",
    descricao: "",
    regiao: ""
};