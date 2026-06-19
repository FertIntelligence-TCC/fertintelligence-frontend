// src/components/FertilizationTable/types.ts

// --- Enums do Backend ---

export enum SpacingType {
    ENTRE_LINHAS = "BETWEEN_LINES_IN_METERS",
    ENTRE_PLANTAS_COVAS = "BETWEEN_PLANTS_OR_HOLES_IN_METERS",
    PLANTAS_POR_METRO_LINEAR = "PLANTS_PER_LINEAR_METER"
}

export const SpacingLabels: Record<SpacingType, string> = {
    [SpacingType.ENTRE_LINHAS]: "Entre Linhas (m)",
    [SpacingType.ENTRE_PLANTAS_COVAS]: "Entre Plantas/Covas (m)",
    [SpacingType.PLANTAS_POR_METRO_LINEAR]: "Plantas por metro linear (m)"
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
    [CropType.ALGODAO]: "Gossypium_hirsutum",
    [CropType.AMENDOIM]: "Arachis_hypogaea",
    [CropType.CANA_DE_ACUCAR]: "Saccharum_officinarum",
    [CropType.FEIJAO_CAUPI]: "Vigna_unguiculata",
    [CropType.FEIJAO_COMUM]: "Phaseolus_vulgaris",
    [CropType.GERGELIM]: "Sesamum_indicum",
    [CropType.MAMONA]: "Ricinus_communis",
    [CropType.MILHO]: "Zea_mays",
    [CropType.SISAL]: "Agave_sisalana",
    [CropType.SOJA]: "Glycine_max"
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

export interface CoverageCell {
    coverageId?: number;
    value: string;
}

export interface NutrientRangeRow {
    id: string;

    contentRangeId?: number;

    label: string;
    operatorType: "less" | "between" | "more";

    plantio: string;

    coberturas: CoverageCell[];
}

export type MicronutrientDoseKey = "b" | "cu" | "fe" | "ni" | "mn" | "mo" | "zn";

export type MicronutrientDoseRange = {
    min: string;
    max: string;
};

export type MicronutrientDoses = Record<MicronutrientDoseKey, MicronutrientDoseRange>;

export const MICRONUTRIENT_DOSE_KEYS: MicronutrientDoseKey[] = ["b", "cu", "fe", "ni", "mn", "mo", "zn"];

export const MICRONUTRIENT_DOSE_LABELS: Record<MicronutrientDoseKey, string> = {
    b: "B",
    cu: "Cu",
    fe: "Fe",
    ni: "Ni",
    mn: "Mn",
    mo: "Mo",
    zn: "Zn",
};

export const createEmptyMicronutrientDoses = (): MicronutrientDoses => ({
    b: { min: "", max: "" },
    cu: { min: "", max: "" },
    fe: { min: "", max: "" },
    ni: { min: "", max: "" },
    mn: { min: "", max: "" },
    mo: { min: "", max: "" },
    zn: { min: "", max: "" },
});

export type FertilizationTableFormState = {
    id?: number; // Opcional, existe apenas na edição
    
    nomeComum: CropType | "";
    nomeCientifico: string;
    regiao: RegionType | "";

    cultivares: string;
    
    espacamentoSugeridoTipo: SpacingType;
    espacamentoSugeridoMin: string;
    espacamentoSugeridoMax: string;

    espacamentoUsadoTipo: SpacingType | "";
    espacamentoUsadoMin: string;
    espacamentoUsadoMax: string;

    produtividadeRegional: string;
    produtividadeEsperada: string;

    criterioCalagem: LimingCriteria | "";
    criterioCalagemIndicado: string;

    propertyId: string;
    plotId: string;
    physicalAnalysisId: string;
    fertilityAnalysisId: string;
    
    sugestaoEstercoTipo: ManureType;
    sugestaoEstercoQtd: string;

    sugestaoGessagem: string;
    dosesMicronutrientes: MicronutrientDoses;

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
    espacamentoUsadoTipo: "",
    espacamentoUsadoMin: "",
    espacamentoUsadoMax: "",
    produtividadeRegional: "",
    produtividadeEsperada: "",
    criterioCalagem: "",
    criterioCalagemIndicado: "Não é possível definir um critério de calagem",
    propertyId: "",
    plotId: "",
    physicalAnalysisId: "",
    fertilityAnalysisId: "",
    sugestaoEstercoTipo: ManureType.BOVINO,
    sugestaoEstercoQtd: "",
    sugestaoGessagem: "",
    dosesMicronutrientes: createEmptyMicronutrientDoses(),
    
    coberturaLabels: ["1ª Cobertura", "2ª Cobertura"], 
    plantioN: "",
    coberturasN: ["", ""],
    faixasP: [],
    faixasK: [],
    observacoes: "",
    fontes: "",
    tabelaPublica: false
};