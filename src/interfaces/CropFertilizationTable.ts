// --- Enums (Devem corresponder aos Enums do Java) ---

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

export enum RegionType {
    NORDESTE = "NORDESTE",
    SUL = "SUL",
    CENTRO_OESTE = "CENTRO_OESTE",
    SUDESTE = "SUDESTE",
    NORTE = "NORTE"
}

export enum NutrientType {
    NITROGENIO = "NITROGENIO",
    FOSFORO = "FOSFORO",
    POTASSIO = "POTASSIO"
}

// --- DTOs de Resposta (GET) - snake_case ---

export interface CoverageResponseDto {
    id: number;
    id_intervalo_teor: number;
    ordem_cobertura: number;
    aplicacao_recomendada_cobertura: number;
}

export interface ContentRangeResponseDto {
    id: number;
    id_tabela: number;
    nutriente: string; // ou NutrientType
    ordem_teor: number;
    menor_teor?: number | null;
    maior_teor?: number | null;
    aplicacao_recomendada_plantio?: number | null;
    
    // Auxiliar para frontend (não vem do backend puro, mas usado na hidratação)
    coverages?: CoverageResponseDto[]; 
}

export interface CropFertilizationTableResponseDto {
    id: number;
    id_criador: number;
    nome_criador: string;
    
    regioes_cultura: RegionType;
    nome_comum_cultura: CropType;
    nome_cientifico_cultura: string;
    cultivares: string;
    
    espacamentos_sugeridos: SpacingType;
    valor_inicial: number;
    valor_final: number;
    
    espacamento_usado: SpacingType;
    valor_espacamento_usado: number;
    
    produtividade_regional: number;
    produtividade_esperada: number;
    
    criterio_de_calagem: LimingCriteria;
    
    tipo_de_esterco: ManureType;
    quantidade_de_esterco: number;
    
    sugestao_gessagem: number;
    sugestao_micronutrientes: number;
    sugestao_npk: number;
    
    observacoes: string;
    tabela_publica?: boolean;

    // Auxiliar para frontend (usado após hidratação)
    rangesWithCoverages?: ContentRangeResponseDto[];
}

// --- DTOs de Requisição (POST/Register) ---

export interface CoverageCreateRequestDto {
    ordem_cobertura: number;
    aplicacao_recomendada_cobertura: number | null;
}

export interface ContentRangeCreateRequestDto {
    nutriente: string;
    ordem_teor: number;
    menor_teor: number | null;
    maior_teor: number | null;
    aplicacao_recomendada_plantio: number | null;
}

export interface CropFertilizationTableCreateRequestDto {
    nome_comum_cultura: CropType;
    nome_cientifico_cultura: string;
    cultivares: string;
    regioes_cultura: RegionType;
    
    espacamentos_sugeridos: SpacingType;
    valor_inicial: number;
    valor_final: number;
    
    espacamento_usado: SpacingType;
    valor_espacamento_usado: number;
    
    produtividade_regional: number;
    produtividade_esperada: number;
    
    criterio_de_calagem: LimingCriteria;
    
    tipo_de_esterco: ManureType;
    quantidade_de_esterco: number;
    
    sugestao_gessagem: number;
    sugestao_micronutrientes: number;
    sugestao_npk: number;
    
    observacoes: string;
    tabela_publica?: boolean;
}