// src/components/FertilizationTable/types.ts

// --- Enums do Backend ---

export enum SpacingType {
    ENTRE_LINHAS = "BETWEEN_LINES_IN_METERS",
    ENTRE_PLANTAS_COVAS = "BETWEEN_PLANTS_OR_HOLES_IN_METERS",
    PLANTAS_POR_METRO_LINEAR = "PLANTAS_PER_LINEAR_METER"
}

export enum LimingCriteria {
    SATURACAO_POR_BASES = "SATURACAO_POR_BASES_TROCAVEIS",
    NEUTRALIZACAO_AL_TROCAVEL = "NEUTRALIZACAO_ALUMINIO_TROCAVEL",
    ELEVACAO_TEOR_CA_MG = "ELEVACAO__DO_TEOR_DE_CALCIO_MAIS_MAGNESIO",
    NEUTRALIZACAO_AL_ELEVACAO_CA_MG = "NEUTRALIZACAO_POR_ALUMINIO_TROCAVEL_MAIS_ELEVACAO_DO_TEOR_DE_CALCIO_MAIS_MAGNESIO"
}

export enum ManureType {
    BOVINO = "BOVINO",
    CAPRINO = "CAPRINO",
    OVINO = "OVINO",
    FRANGO = "FRANGO",
    TORTA_MAMONA = "TORTAS"
}

// Novo Enum para Nome Comum da Cultura
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

// --- Mapeamentos e Labels ---

// Mapeamento automático para Nome Científico
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

// Labels amigáveis para o Select (Opcional, mas melhora a UX)
export const CropLabels: Record<CropType, string> = {
    [CropType.ALGODAO]: "Algodão",
    [CropType.AMENDOIM]: "Amendoim",
    [CropType.CANA_DE_ACUCAR]: "Cana-de-açúcar",
    [CropType.FEIJAO_CAUPI]: "Feijão-caupi",
    [CropType.FEIJAO_COMUM]: "Feijão-comum",
    [CropType.GERGELIM]: "Gergelim",
    [CropType.MAMONA]: "Mamona",
    [CropType.MILHO]: "Milho",
    [CropType.SISAL]: "Sisal",
    [CropType.SOJA]: "Soja"
};

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

// --- Tipos de Estado do Formulário ---

export type NutrientRangeRow = {
    id: string; 
    label: string; 
    operatorType: "less" | "between" | "more"; 
    plantio: string; 
    coberturas: string[]; 
};

export type FertilizationTableFormState = {
    id?: number;
    nomeComum: CropType | ""; // Agora é tipado com o Enum ou vazio
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

    coberturaLabels: string[]; 
    plantioN: string;
    coberturasN: string[];
    faixasP: NutrientRangeRow[];
    faixasK: NutrientRangeRow[];

    observacoes: string;
};

export const DEFAULT_TABLE_STATE: FertilizationTableFormState = {
    nomeComum: "", // Inicializa vazio
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