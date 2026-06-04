// src/components/FertilizationTable/types.ts

// --- Enums do Backend ---

export enum SpacingType {
    ENTRE_LINHAS = "BETWEEN_LINES_IN_METERS",
    ENTRE_PLANTAS_COVAS = "BETWEEN_PLANTS_OR_HOLES_IN_METERS",
    PLANTAS_POR_METRO_LINEAR = "PLANTAS_PER_LINEAR_METER"
}

export const SpacingLabels: Record<SpacingType, string> = {
    [SpacingType.ENTRE_LINHAS]: "Entre Linhas (m)",
    [SpacingType.ENTRE_PLANTAS_COVAS]: "Entre Plantas/Covas (m)",
    [SpacingType.PLANTAS_POR_METRO_LINEAR]: "Plantas por Metro Linear"
};

export enum LimingCriteria {
    SATURACAO_POR_BASES = "SATURACAO_POR_BASES_TROCAVEIS",
    NEUTRALIZACAO_AL_TROCAVEL = "NEUTRALIZACAO_ALUMINIO_TROCAVEL",
    ELEVACAO_TEOR_CA_MG = "ELEVACAO__DO_TEOR_DE_CALCIO_MAIS_MAGNESIO", // Verifique se o backend manda com 2 underscores ou 1
    NEUTRALIZACAO_AL_ELEVACAO_CA_MG = "NEUTRALIZACAO_POR_ALUMINIO_TROCAVEL_MAIS_ELEVACAO_DO_TEOR_DE_CALCIO_MAIS_MAGNESIO"
}

export const LimingLabels: Record<LimingCriteria, string> = {
    [LimingCriteria.SATURACAO_POR_BASES]: "Saturação por Bases (V%)",
    [LimingCriteria.NEUTRALIZACAO_AL_TROCAVEL]: "Neutralização de Alumínio",
    [LimingCriteria.ELEVACAO_TEOR_CA_MG]: "Elevação de Ca + Mg",
    [LimingCriteria.NEUTRALIZACAO_AL_ELEVACAO_CA_MG]: "Neutr. Al + Elev. Ca/Mg"
};

export enum ManureType {
    BOVINO = "BOVINO",
    CAPRINO = "CAPRINO",
    OVINO = "OVINO",
    FRANGO = "FRANGO",
    TORTA_MAMONA = "TORTAS"
}

export const ManureLabels: Record<ManureType, string> = {
    [ManureType.BOVINO]: "Bovino",
    [ManureType.CAPRINO]: "Caprino",
    [ManureType.OVINO]: "Ovino",
    [ManureType.FRANGO]: "Frango/Aves",
    [ManureType.TORTA_MAMONA]: "Torta de Mamona"
};

// --- Culturas ---
export enum CropType {
    ALGODAO = "ALGODAO",
    AMENDOIM = "AMENDOIM",
    CANA_DE_ACUCAR = "CANA_DE_ACUCAR",
    FEIJAO_CAUPI = "FEIJAO_CAUPI",
    FEIJAO_COMUM = "FEIJAO_COMUM",
    GERGELIM = "GERGELIM",
    MAMONA = "MAMONA",
    MILHO = "MILHO",
    SISAL = "SISAL",
    SOJA = "SOJA"
}

export const CropLabels: Record<CropType, string> = {
    [CropType.ALGODAO]: "Algodão",
    [CropType.AMENDOIM]: "Amendoim",
    [CropType.CANA_DE_ACUCAR]: "Cana-de-açúcar",
    [CropType.FEIJAO_CAUPI]: "Feijão Caupi",
    [CropType.FEIJAO_COMUM]: "Feijão Comum",
    [CropType.GERGELIM]: "Gergelim",
    [CropType.MAMONA]: "Mamona",
    [CropType.MILHO]: "Milho",
    [CropType.SISAL]: "Sisal",
    [CropType.SOJA]: "Soja"
};

export const CropScientificNames: Record<CropType, string> = {
    [CropType.ALGODAO]: "Gossypium hirsutum",
    [CropType.AMENDOIM]: "Arachis hypogaea",
    [CropType.CANA_DE_ACUCAR]: "Saccharum officinarum",
    [CropType.FEIJAO_CAUPI]: "Vigna unguiculata",
    [CropType.FEIJAO_COMUM]: "Phaseolus vulgaris",
    [CropType.GERGELIM]: "Sesamum indicum",
    [CropType.MAMONA]: "Ricinus communis",
    [CropType.MILHO]: "Zea mays",
    [CropType.SISAL]: "Agave sisalana",
    [CropType.SOJA]: "Glycine max"
};

// --- Regiões ---
export enum RegionType {
    NORDESTE = "NORDESTE",
    SUL = "SUL",
    CENTRO_OESTE = "CENTRO_OESTE",
    SUDESTE = "SUDESTE",
    NORTE = "NORTE"
}

export const RegionLabels: Record<RegionType, string> = {
    [RegionType.NORDESTE]: "Nordeste",
    [RegionType.SUL]: "Sul",
    [RegionType.CENTRO_OESTE]: "Centro-Oeste",
    [RegionType.SUDESTE]: "Sudeste",
    [RegionType.NORTE]: "Norte"
};

// --- Interfaces de Estado do Formulário ---

export interface NutrientRangeRow {
    id: string;
    label: string; 
    operatorType: "less" | "between" | "more";
    plantio: string; // Valor numérico como string
    coberturas: string[]; // Valores numéricos como string
}

export type FertilizationTableFormState = {
    id?: number; // Opcional, existe apenas na edição
    
    nomeComum: CropType | "";
    nomeCientifico: string;
    regiao: RegionType | "";

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
    
    sugestaoNPK: string;

    coberturaLabels: string[]; 
    plantioN: string;
    coberturasN: string[];
    faixasP: NutrientRangeRow[];
    faixasK: NutrientRangeRow[];

    observacoes: string;
    fontes: string;
    tabelaPublica: boolean;
};

export const DEFAULT_TABLE_STATE: FertilizationTableFormState = {
    nomeComum: "", 
    nomeCientifico: "",
    regiao: "",
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
    sugestaoNPK: "",
    
    coberturaLabels: ["1ª Cobertura", "2ª Cobertura"], 
    plantioN: "",
    coberturasN: ["", ""],
    faixasP: [],
    faixasK: [],
    observacoes: "",
    fontes: "",
    tabelaPublica: false
};