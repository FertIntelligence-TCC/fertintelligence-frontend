// src/interfaces/CropFertilizationTable.ts

export enum SpacingType {
    ENTRE_LINHAS = "ENTRE_LINHAS", // Ajuste conforme o enum do backend
    ENTRE_PLANTAS = "ENTRE_PLANTAS",
    PLANTAS_POR_METRO = "PLANTAS_POR_METRO"
}

export enum NutrientType {
    N = "N",
    P2O5 = "P2O5",
    K2O = "K2O"
}

export interface CoverageDto {
    id?: number;
    label: string; // Ex: "1ª cobertura"
    orderIndex?: number;
}

export interface ContentRangeDto {
    id?: number;
    nutrient: NutrientType;
    min?: number;
    max?: number;
    operatorLabel: string; // Ex: "P2O5 < 10" ou construído no front
    plantioValue: number;
    coverageValues: number[]; // Lista ordenada correspondente às Coverages
}

export interface CropFertilizationTableResponseDto {
    id: number;
    nomeComum: string;
    nomeCientifico: string;
    cultivares: string;
    
    // Espaçamento Sugerido
    espacamentoSugeridoTipo: SpacingType;
    espacamentoSugeridoMin: number;
    espacamentoSugeridoMax: number;

    // Espaçamento Usado
    espacamentoUsadoTipo: SpacingType;
    espacamentoUsadoValor: number;

    produtividadeRegional: number;
    produtividadeEsperada: number;
    criterioCalagem: string; // Enum no backend

    sugestaoEstercoTipo: string;
    sugestaoEstercoQtd: number;
    sugestaoGessagem: number;
    sugestaoMicronutrientes: number;

    sugestaoN: number;
    sugestaoP: number;
    sugestaoK: number;

    observacoes: string;

    coverages: CoverageDto[];
    contentRanges: ContentRangeDto[];
}

export interface CropFertilizationTableCreateRequestDto extends Omit<CropFertilizationTableResponseDto, 'id' | 'coverages' | 'contentRanges'> {
    coverages: Omit<CoverageDto, 'id'>[];
    contentRanges: Omit<ContentRangeDto, 'id'>[];
}