export enum CulturaEnum {
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

export enum RegionEnum {
    NORDESTE = "NORDESTE",
    CENTRO_OESTE = "CENTRO_OESTE",
    SUL = "SUL"
}

export interface NutrientRange {
    min: number;
    max: number;
}

export type UnidadeTeor =
    | "dag_per_kg"
    | "mg_per_kg"
    | "g_per_kg"
    | "g_per_dm3"
    | "mg_per_dm3"
    | "cmolc_per_dm3"
    | "mmolc_per_dm3"
    | "percentage";

export const UnidadeTeorLabels: Record<UnidadeTeor, string> = {
    dag_per_kg: "dag/kg",
    mg_per_kg: "mg/kg",
    g_per_kg: "g/kg",
    g_per_dm3: "g/dm³",
    mg_per_dm3: "mg/dm³",
    cmolc_per_dm3: "cmolc/dm³",
    mmolc_per_dm3: "mmolc/dm³",
    percentage: "%",
};

export const formatUnidadeTeor = (unity?: string | null): string => {
    if (!unity) return "-";
    return UnidadeTeorLabels[unity as UnidadeTeor] ?? unity;
};

export interface FoliarTableItemDto {
    cultura: CulturaEnum;
    // Macros (dag/kg)
    n: NutrientRange;
    p: NutrientRange;
    k: NutrientRange;
    ca: NutrientRange;
    mg: NutrientRange;
    s: NutrientRange;
    // Micros (mg/kg)
    b: NutrientRange;
    cu: NutrientRange;
    fe: NutrientRange;
    mn: NutrientRange;
    mo: NutrientRange;
    zn: NutrientRange;
}

// GET /get-all
export interface FoliarTableResponseDto {
    id: number;
    nome_tabela?: string; 
    region?: RegionEnum; // Região vinda do backend
    itens: FoliarTableItemDto[];
    nome_criador?: string;
    nome_comum_cultura?: string;
    cultivares?: string;
    tabela_publica?: boolean;
}

// POST /register
export interface FoliarTableCreateRequestDto {
    nome_tabela: string;
    region: RegionEnum; // Campo Obrigatório
    itens: FoliarTableItemDto[];
    tabela_publica?: boolean;
}

// PUT /update
export interface FoliarTablePostRequestDto {
    novo_nome_tabela: string;
    nova_region?: RegionEnum;
    novos_itens: FoliarTableItemDto[];
    tabela_publica?: boolean;
}

// --- STATE DO FORMULÁRIO (Strings para controle de input) ---

export interface NutrientRangeState {
    min: string;
    max: string;
}

export interface FoliarTableRowState {
    cultura: string;
    // Macros
    n: NutrientRangeState;
    p: NutrientRangeState;
    k: NutrientRangeState;
    ca: NutrientRangeState;
    mg: NutrientRangeState;
    s: NutrientRangeState;
    // Micros
    b: NutrientRangeState;
    cu: NutrientRangeState;
    fe: NutrientRangeState;
    mn: NutrientRangeState;
    mo: NutrientRangeState;
    zn: NutrientRangeState;
}

export interface FoliarTableFormState {
    nome: string;
    region: string; // Estado da região
    rows: FoliarTableRowState[];
    tabelaPublica: boolean;
}

export const DEFAULT_NUTRIENT_RANGE: NutrientRangeState = { min: "", max: "" };

export const DEFAULT_ROW_STATE: FoliarTableRowState = {
    cultura: "",
    n: { ...DEFAULT_NUTRIENT_RANGE },
    p: { ...DEFAULT_NUTRIENT_RANGE },
    k: { ...DEFAULT_NUTRIENT_RANGE },
    ca: { ...DEFAULT_NUTRIENT_RANGE },
    mg: { ...DEFAULT_NUTRIENT_RANGE },
    s: { ...DEFAULT_NUTRIENT_RANGE },
    b: { ...DEFAULT_NUTRIENT_RANGE },
    cu: { ...DEFAULT_NUTRIENT_RANGE },
    fe: { ...DEFAULT_NUTRIENT_RANGE },
    mn: { ...DEFAULT_NUTRIENT_RANGE },
    mo: { ...DEFAULT_NUTRIENT_RANGE },
    zn: { ...DEFAULT_NUTRIENT_RANGE },
};

export const DEFAULT_FOLIAR_TABLE_STATE: FoliarTableFormState = {
    nome: "",
    region: "",
    rows: [],
    tabelaPublica: false
};