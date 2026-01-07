// src/components/FertilizationTable/types.ts

// --- Enums do Backend (devem dar match com os Enums Java) ---

export enum SpacingType {
    ENTRE_LINHAS = "ENTRE_LINHAS",
    ENTRE_PLANTAS_COVAS = "ENTRE_PLANTAS_COVAS",
    PLANTAS_POR_METRO_LINEAR = "PLANTAS_POR_METRO_LINEAR"
}

export enum LimingCriteria {
    SATURACAO_POR_BASES = "SATURACAO_POR_BASES",
    NEUTRALIZACAO_AL_TROCAVEL = "NEUTRALIZACAO_AL_TROCAVEL",
    ELEVACAO_TEOR_CA_MG = "ELEVACAO_TEOR_CA_MG",
    NEUTRALIZACAO_AL_ELEVACAO_CA_MG = "NEUTRALIZACAO_AL_ELEVACAO_CA_MG"
}

export enum ManureType {
    BOVINO = "BOVINO",
    CAPRINO = "CAPRINO",
    OVINO = "OVINO",
    FRANGO = "FRANGO",
    TORTA_MAMONA = "TORTA_MAMONA"
}

export enum NutrientType {
    N = "N",
    P2O5 = "P2O5",
    K2O = "K2O"
}

// --- Labels para Exibição no Frontend ---

export const SpacingLabels: Record<SpacingType, string> = {
    [SpacingType.ENTRE_LINHAS]: "Entre linhas",
    [SpacingType.ENTRE_PLANTAS_COVAS]: "Entre plantas/covas",
    [SpacingType.PLANTAS_POR_METRO_LINEAR]: "Plantas por metro linear"
};

export const LimingLabels: Record<LimingCriteria, string> = {
    [LimingCriteria.SATURACAO_POR_BASES]: "Saturação por bases trocáveis",
    [LimingCriteria.NEUTRALIZACAO_AL_TROCAVEL]: "Neutralização do Al trocável",
    [LimingCriteria.ELEVACAO_TEOR_CA_MG]: "Elevação do teor de Ca+Mg",
    [LimingCriteria.NEUTRALIZACAO_AL_ELEVACAO_CA_MG]: "Neutralização de Al trocável + elevação e Ca+Mg"
};

export const ManureLabels: Record<ManureType, string> = {
    [ManureType.BOVINO]: "Bovino",
    [ManureType.CAPRINO]: "Caprino",
    [ManureType.OVINO]: "Ovino",
    [ManureType.FRANGO]: "Frango",
    [ManureType.TORTA_MAMONA]: "Torta Mamona"
};

// --- Tipos de Estado do Formulário (Frontend UI State) ---

export type NutrientRangeRow = {
    id: string; // ID temporário para key do React
    label: string; // Ex: "P2O5 < 10"
    plantio: string; 
    coberturas: string[]; 
};

export type FertilizationTableFormState = {
    id?: number;
    nomeComum: string;
    nomeCientifico: string;
    cultivares: string;
    
    espacamentoSugeridoTipo: SpacingType;
    espacamentoSugeridoMin: string;
    espacamentoSugeridoMax: string;

    espacamentoUsadoTipo: SpacingType;
    espacamentoUsadoValor: string;

    produtividadeRegional: string;
    produtividadeEsperada: string;

    criterioCalagem: LimingCriteria;
    
    sugestaoEstercoTipo: ManureType;
    sugestaoEstercoQtd: string;

    sugestaoGessagem: string;
    sugestaoMicronutrientes: string;
    
    sugestaoN: string;
    sugestaoP: string;
    sugestaoK: string;

    // Campos Dinâmicos da Tabela
    coberturaLabels: string[]; 
    
    // Nitrogênio (Linha Única Fixa)
    plantioN: string;
    coberturasN: string[];

    // Fósforo (Múltiplas Faixas)
    faixasP: NutrientRangeRow[];

    // Potássio (Múltiplas Faixas)
    faixasK: NutrientRangeRow[];

    observacoes: string;
};

export const DEFAULT_TABLE_STATE: FertilizationTableFormState = {
    nomeComum: "",
    nomeCientifico: "",
    cultivares: "",
    espacamentoSugeridoTipo: SpacingType.ENTRE_LINHAS,
    espacamentoSugeridoMin: "",
    espacamentoSugeridoMax: "",
    espacamentoUsadoTipo: SpacingType.ENTRE_LINHAS,
    espacamentoUsadoValor: "",
    produtividadeRegional: "",
    produtividadeEsperada: "",
    criterioCalagem: LimingCriteria.SATURACAO_POR_BASES,
    sugestaoEstercoTipo: ManureType.BOVINO,
    sugestaoEstercoQtd: "",
    sugestaoGessagem: "",
    sugestaoMicronutrientes: "",
    sugestaoN: "",
    sugestaoP: "",
    sugestaoK: "",
    coberturaLabels: ["Cobertura/1ª cobertura"],
    plantioN: "",
    coberturasN: [""],
    faixasP: [],
    faixasK: [],
    observacoes: ""
};