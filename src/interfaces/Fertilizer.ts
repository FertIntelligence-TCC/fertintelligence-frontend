// src/interfaces/Fertilizer.ts

export type FertilizerPhotoIds = string[];

export interface FertilizerPhotoCarrier {
    ids_fotos?: FertilizerPhotoIds;
    idfotos?: FertilizerPhotoIds;
    fotos?: FertilizerPhotoIds;
    fotoIds?: FertilizerPhotoIds;
}

export const getFertilizerPhotoIds = (item?: FertilizerPhotoCarrier): FertilizerPhotoIds => {
    if (!item) return [];
    const photoIds = item.ids_fotos ?? item.idfotos ?? item.fotos ?? item.fotoIds ?? [];
    return photoIds.filter(Boolean).slice(0, 5);
};

export const calculateOrganicCarbon = (organicMatter: string | number): number => {
    const value = typeof organicMatter === "number" ? organicMatter : parseFloat(organicMatter);
    return Number.isFinite(value) ? Number((value / 1.724).toFixed(1)) : 0;
};

export const formatOrganicCarbon = (organicMatter: string | number): string =>
    calculateOrganicCarbon(organicMatter).toFixed(1).replace(".", ",");

export const getOrganicMatterContent = (item: {
    teor_materia_organica?: number | null;
    teor_cinzas?: number | null;
    c?: number | null;
}): number => item.teor_materia_organica ?? item.teor_cinzas ?? ((item.c ?? 0) * 1.724);

export interface FertilizerCommercialPriceResponseFields {
    data_tomada_preco?: string | null;
    preco_saco_5kg?: number | null;
    preco_saco_25kg?: number | null;
    preco_saco_50kg?: number | null;
    preco_saco_1000kg?: number | null;
    preco_saco_5_kg?: number | null;
    preco_saco_25_kg?: number | null;
    preco_saco_50_kg?: number | null;
    preco_saco_1000_kg?: number | null;
}

export interface FertilizerCommercialPriceCreateFields {
    data_tomada_preco?: string | null;
    preco_saco_5_kg?: number | null;
    preco_saco_25_kg?: number | null;
    preco_saco_50_kg?: number | null;
    preco_saco_1000_kg?: number | null;
}

export interface FertilizerCommercialPriceUpdateFields {
    nova_data_tomada_preco?: string | null;
    novo_preco_saco_5_kg?: number | null;
    novo_preco_saco_25_kg?: number | null;
    novo_preco_saco_50_kg?: number | null;
    novo_preco_saco_1000_kg?: number | null;
}

export interface FertilizerCommercialPriceFormFields {
    dataTomadaPreco: string;
    precoSaco5Kg: string;
    precoSaco25Kg: string;
    precoSaco50Kg: string;
    precoSaco1000Kg: string;
}

export const DEFAULT_FERTILIZER_COMMERCIAL_PRICE_FORM_FIELDS: FertilizerCommercialPriceFormFields = {
    dataTomadaPreco: "",
    precoSaco5Kg: "",
    precoSaco25Kg: "",
    precoSaco50Kg: "",
    precoSaco1000Kg: "",
};

const normalizeDecimalText = (value: string): string => value.trim().replace(/\./g, "").replace(",", ".");

export const optionalFertilizerDecimal = (value: string): number | null => {
    const normalized = normalizeDecimalText(value);
    if (!normalized) return null;

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
};

export const formatFertilizerCommercialPriceDateForForm = (value?: string | null): string => {
    if (!value) return "";

    const [datePart] = String(value).split("T");
    const isoMatch = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;

    const brMatch = datePart.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (brMatch) return datePart;

    return String(value);
};

export const parseFertilizerCommercialPriceDateForPayload = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (brMatch) return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;

    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) return trimmed;

    return trimmed;
};

export const getFertilizerCommercialPriceValue = (
    item: FertilizerCommercialPriceResponseFields | undefined,
    packageSize: "5" | "25" | "50" | "1000"
): number | null => {
    if (!item) return null;

    switch (packageSize) {
        case "5":
            return item.preco_saco_5kg ?? item.preco_saco_5_kg ?? null;
        case "25":
            return item.preco_saco_25kg ?? item.preco_saco_25_kg ?? null;
        case "50":
            return item.preco_saco_50kg ?? item.preco_saco_50_kg ?? null;
        case "1000":
            return item.preco_saco_1000kg ?? item.preco_saco_1000_kg ?? null;
    }
};

export const fertilizerCommercialPriceResponseToForm = (
    item: FertilizerCommercialPriceResponseFields
): FertilizerCommercialPriceFormFields => {
    const precoSaco5Kg = getFertilizerCommercialPriceValue(item, "5");
    const precoSaco25Kg = getFertilizerCommercialPriceValue(item, "25");
    const precoSaco50Kg = getFertilizerCommercialPriceValue(item, "50");
    const precoSaco1000Kg = getFertilizerCommercialPriceValue(item, "1000");

    return {
        dataTomadaPreco: formatFertilizerCommercialPriceDateForForm(item.data_tomada_preco),
        precoSaco5Kg: precoSaco5Kg == null ? "" : String(precoSaco5Kg),
        precoSaco25Kg: precoSaco25Kg == null ? "" : String(precoSaco25Kg),
        precoSaco50Kg: precoSaco50Kg == null ? "" : String(precoSaco50Kg),
        precoSaco1000Kg: precoSaco1000Kg == null ? "" : String(precoSaco1000Kg),
    };
};

export const fertilizerCommercialPriceFormToCreatePayload = (
    form: FertilizerCommercialPriceFormFields
): FertilizerCommercialPriceCreateFields => ({
    data_tomada_preco: parseFertilizerCommercialPriceDateForPayload(form.dataTomadaPreco),
    preco_saco_5_kg: optionalFertilizerDecimal(form.precoSaco5Kg),
    preco_saco_25_kg: optionalFertilizerDecimal(form.precoSaco25Kg),
    preco_saco_50_kg: optionalFertilizerDecimal(form.precoSaco50Kg),
    preco_saco_1000_kg: optionalFertilizerDecimal(form.precoSaco1000Kg),
});

export const fertilizerCommercialPriceFormToUpdatePayload = (
    form: FertilizerCommercialPriceFormFields
): FertilizerCommercialPriceUpdateFields => ({
    nova_data_tomada_preco: parseFertilizerCommercialPriceDateForPayload(form.dataTomadaPreco),
    novo_preco_saco_5_kg: optionalFertilizerDecimal(form.precoSaco5Kg),
    novo_preco_saco_25_kg: optionalFertilizerDecimal(form.precoSaco25Kg),
    novo_preco_saco_50_kg: optionalFertilizerDecimal(form.precoSaco50Kg),
    novo_preco_saco_1000_kg: optionalFertilizerDecimal(form.precoSaco1000Kg),
});

// --- ADUBOS MINERAIS SIMPLES ---

// GET /get-all
export interface SimpleMineralFertilizerResponseDto {
    id: number;
    publico?: boolean;
    nome_criador?: string;
    nome_adubo: string; // @JsonProperty("nome_adubo")
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
    indice_salino: number; // @JsonProperty("indice_salino")
    indice_acidez: number; // @JsonProperty("indice_acidez")
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
}

// POST /register
export interface SimpleMineralFertilizerCreateRequestDto {
    publico?: boolean;
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
    nome_adubo: string;
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
    indice_salino: number;
    indice_acidez: number;
}

// PUT /update (Com prefixo "novo_")
export interface SimpleMineralFertilizerPostRequestDto {
    novo_publico?: boolean;
    novos_ids_fotos?: FertilizerPhotoIds;
    novo_observacao?: string;
    novo_fonte?: string;
    novo_nome_adubo: string;
    novo_n: number;
    novo_p2o5: number;
    novo_k2o: number;
    novo_ca: number;
    novo_mg: number;
    novo_s: number;
    novo_b: number;
    novo_cu: number;
    novo_fe: number;
    novo_mn: number;
    novo_mo: number;
    novo_zn: number;
    novo_indice_salino: number;
    novo_indice_acidez: number;
}

// Estado interno do formulário (React)
export interface SimpleMineralFertilizerFormState {
    publico?: "sim" | "nao";
    fotoIds?: FertilizerPhotoIds;
    observacao: string;
    fonte: string;
    nome: string;
    n: string;
    p2o5: string;
    k2o: string;
    ca: string;
    mg: string;
    s: string;
    b: string;
    cu: string;
    fe: string;
    mn: string;
    mo: string;
    zn: string;
    indiceSalino: string;
    indiceAcidez: string;
}

export const DEFAULT_SIMPLE_MINERAL_FORM_STATE: SimpleMineralFertilizerFormState = {
    ...DEFAULT_FERTILIZER_COMMERCIAL_PRICE_FORM_FIELDS,
    nome: "",
    fotoIds: [],
    observacao: "",
    fonte: "",
    n: "", p2o5: "", k2o: "",
    ca: "", mg: "", s: "",
    b: "", cu: "", fe: "", mn: "", mo: "", zn: "",
    indiceSalino: "", indiceAcidez: "",
    publico: "nao"
};

// --- ADUBOS MINERAIS FORMULADOS ---

export interface FormulateDto {
    n: number;
    p: number;
    k: number;
}

export interface NPKRelationDto {
    n: number;
    p: number;
    k: number;
}

// GET /get-all
export interface FormulatedMineralFertilizerResponseDto {
    id: number;
    publico?: boolean;
    nome_criador?: string;
    formulate?: FormulateDto;
    relation?: NPKRelationDto;
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
    indicatedFormulaNumber: number; // @JsonProperty("numero_formula_indicada")
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
}

// POST /register
export interface FormulatedMineralFertilizerCreateRequestDto {
    publico?: boolean;
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
    formulate?: FormulateDto;
    relation?: NPKRelationDto;
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
    numero_formula_indicada: number;
}

// PUT /update (com prefixo "novo_")
export interface FormulatedMineralFertilizerPostRequestDto {
    novo_publico?: boolean;
    novos_ids_fotos?: FertilizerPhotoIds;
    novo_observacao?: string;
    novo_fonte?: string;
    novo_formulate?: FormulateDto;
    novo_relation?: NPKRelationDto;
    novo_n: number;
    novo_p2o5: number;
    novo_k2o: number;
    novo_ca: number;
    novo_mg: number;
    novo_s: number;
    novo_b: number;
    novo_cu: number;
    novo_fe: number;
    novo_mn: number;
    novo_mo: number;
    novo_zn: number;
    novo_numero_formula_indicada: number;
}

// Estado do Formulário (Strings para facilitar edição)
export interface FormulatedFertilizerFormState {
    publico?: "sim" | "nao";
    fotoIds?: FertilizerPhotoIds;
    observacao: string;
    fonte: string;
    // Fórmula (Nome do adubo, ex: 04-14-08)
    formulaN: string;
    formulaP: string;
    formulaK: string;

    // Relação (Calculada)
    relacaoN: string;
    relacaoP: string;
    relacaoK: string;

    // Garantias Totais
    n: string;
    p2o5: string;
    k2o: string;
    ca: string;
    mg: string;
    s: string;
    b: string;
    cu: string;
    fe: string;
    mn: string;
    mo: string;
    zn: string;
    numeroFormulaIndicada: string;
}

export const DEFAULT_FORMULATED_FORM_STATE: FormulatedFertilizerFormState = {
    ...DEFAULT_FERTILIZER_COMMERCIAL_PRICE_FORM_FIELDS,
    fotoIds: [],
    observacao: "",
    fonte: "",
    formulaN: "", formulaP: "", formulaK: "",
    relacaoN: "", relacaoP: "", relacaoK: "",
    n: "", p2o5: "", k2o: "",
    ca: "", mg: "", s: "",
    b: "", cu: "", fe: "", mn: "", mo: "", zn: "",
    numeroFormulaIndicada: "",
    publico: "nao"
};

// src/interfaces/Fertilizer.ts

// --- DTOs Auxiliares ---
export interface FormulateDto {
    n: number;
    p: number;
    k: number;
}

export interface NPKRelationDto {
    n: number;
    p: number;
    k: number;
}

// --- SIMPLE MINERAL FERTILIZER ---
export interface SimpleMineralFertilizerResponseDto {
    id: number;
    publico?: boolean;
    nome_criador?: string;
    nome_adubo: string;
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
    indice_salino: number;
    indice_acidez: number;
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
}

export interface SimpleMineralFertilizerCreateRequestDto {
    publico?: boolean;
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
    nome_adubo: string;
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
    indice_salino: number;
    indice_acidez: number;
}

export interface SimpleMineralFertilizerPostRequestDto {
    novo_publico?: boolean;
    novos_ids_fotos?: FertilizerPhotoIds;
    novo_observacao?: string;
    novo_fonte?: string;
    novo_nome_adubo: string;
    novo_n: number;
    novo_p2o5: number;
    novo_k2o: number;
    novo_ca: number;
    novo_mg: number;
    novo_s: number;
    novo_b: number;
    novo_cu: number;
    novo_fe: number;
    novo_mn: number;
    novo_mo: number;
    novo_zn: number;
    novo_indice_salino: number;
    novo_indice_acidez: number;
}

export interface SimpleMineralFertilizerFormState {
    publico?: "sim" | "nao";
    fotoIds?: FertilizerPhotoIds;
    observacao: string;
    fonte: string;
    nome: string;
    n: string;
    p2o5: string;
    k2o: string;
    ca: string;
    mg: string;
    s: string;
    b: string;
    cu: string;
    fe: string;
    mn: string;
    mo: string;
    zn: string;
    indiceSalino: string;
    indiceAcidez: string;
}

// --- FORMULATED MINERAL FERTILIZER ---

// GET /get-all
export interface FormulatedMineralFertilizerResponseDto {
    id: number;
    formula: FormulateDto;   // CORRIGIDO: @JsonProperty("formula")
    relacao: NPKRelationDto; // CORRIGIDO: @JsonProperty("relacao")
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
    numero_formula_indicada: number; // CORRIGIDO: @JsonProperty("numero_formula_indicada")
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
}

// POST /register
export interface FormulatedMineralFertilizerCreateRequestDto {
    formula: FormulateDto;   // CORRIGIDO
    relacao: NPKRelationDto; // CORRIGIDO
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
    numero_formula_indicada: number;
}

// PUT /update
export interface FormulatedMineralFertilizerPostRequestDto {
    nova_formula: FormulateDto;   // CORRIGIDO: prefixo "nova_"
    nova_relacao: NPKRelationDto; // CORRIGIDO: prefixo "nova_"
    novos_ids_fotos?: FertilizerPhotoIds;
    novo_observacao?: string;
    novo_fonte?: string;
    novo_n: number;
    novo_p2o5: number;
    novo_k2o: number;
    novo_ca: number;
    novo_mg: number;
    novo_s: number;
    novo_b: number;
    novo_cu: number;
    novo_fe: number;
    novo_mn: number;
    novo_mo: number;
    novo_zn: number;
    novo_numero_formula_indicada: number;
}

export interface FormulatedFertilizerFormState {
    fotoIds?: FertilizerPhotoIds;
    observacao: string;
    fonte: string;
    formulaN: string;
    formulaP: string;
    formulaK: string;
    relacaoN: string;
    relacaoP: string;
    relacaoK: string;
    n: string;
    p2o5: string;
    k2o: string;
    ca: string;
    mg: string;
    s: string;
    b: string;
    cu: string;
    fe: string;
    mn: string;
    mo: string;
    zn: string;
    numeroFormulaIndicada: string;
}

// --- ORGANO MINERAL FERTILIZER ---

// GET /get-all
export interface OrganoMineralFertilizerResponseDto {
    id: number;
    publico?: boolean;
    nome_criador?: string;
    nome_adubo: string;
    c: number; // Carbono Orgânico
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
    indice_salino: number;
    indice_acidez: number;
    taxa_mineralizacao_primeiro_ano_percentual?: number | null;
    taxa_mineralizacao_segundo_ano_percentual?: number | null;
    taxa_mineralizacao_terceiro_ano_percentual?: number | null;
    taxa_mineralizacao_quarto_ano_percentual?: number | null;
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
}

// POST /register
export interface OrganoMineralFertilizerCreateRequestDto {
    publico?: boolean;
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
    nome_adubo: string;
    c: number;
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
    indice_salino: number;
    indice_acidez: number;
    taxa_mineralizacao_primeiro_ano_percentual?: number | null;
    taxa_mineralizacao_segundo_ano_percentual?: number | null;
    taxa_mineralizacao_terceiro_ano_percentual?: number | null;
    taxa_mineralizacao_quarto_ano_percentual?: number | null;
}

// PUT /update (prefixo "novo_")
export interface OrganoMineralFertilizerPostRequestDto {
    novo_publico?: boolean;
    novos_ids_fotos?: FertilizerPhotoIds;
    novo_observacao?: string;
    novo_fonte?: string;
    novo_nome_adubo: string;
    novo_c: number;
    novo_n: number;
    novo_p2o5: number;
    novo_k2o: number;
    novo_ca: number;
    novo_mg: number;
    novo_s: number;
    novo_b: number;
    novo_cu: number;
    novo_fe: number;
    novo_mn: number;
    novo_mo: number;
    novo_zn: number;
    novo_indice_salino: number;
    novo_indice_acidez: number;
    novo_taxa_mineralizacao_primeiro_ano_percentual?: number | null;
    novo_taxa_mineralizacao_segundo_ano_percentual?: number | null;
    novo_taxa_mineralizacao_terceiro_ano_percentual?: number | null;
    novo_taxa_mineralizacao_quarto_ano_percentual?: number | null;
}

// Estado do Formulário
export interface OrganoMineralFertilizerFormState {
    publico?: "sim" | "nao";
    fotoIds?: FertilizerPhotoIds;
    observacao: string;
    fonte: string;
    nome: string;
    c: string;
    n: string;
    p2o5: string;
    k2o: string;
    ca: string;
    mg: string;
    s: string;
    b: string;
    cu: string;
    fe: string;
    mn: string;
    mo: string;
    zn: string;
    indiceSalino: string;
    indiceAcidez: string;
    taxaMineralizacaoAno1: string;
    taxaMineralizacaoAno2: string;
    taxaMineralizacaoAno3: string;
    taxaMineralizacaoAno4: string;
}

export const DEFAULT_ORGANO_MINERAL_FORM_STATE: OrganoMineralFertilizerFormState = {
    ...DEFAULT_FERTILIZER_COMMERCIAL_PRICE_FORM_FIELDS,
    nome: "",
    fotoIds: [],
    observacao: "",
    fonte: "",
    c: "", n: "", p2o5: "", k2o: "",
    ca: "", mg: "", s: "",
    b: "", cu: "", fe: "", mn: "", mo: "", zn: "",
    indiceSalino: "", indiceAcidez: "",
    taxaMineralizacaoAno1: "",
    taxaMineralizacaoAno2: "",
    taxaMineralizacaoAno3: "",
    taxaMineralizacaoAno4: "",
    publico: "nao"
};

// --- GREEN FERTILIZER ---

// GET /get-all
export interface GreenFertilizerResponseDto {
    id: number;
    publico?: boolean;
    nome_criador?: string;
    nome_adubo: string;
    umidade_incorporacao_percentual?: number | null;
    c: number; // Carbono
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
    produtividade_esperada: number;
    taxa_mineralizacao_ano_1?: number;
    taxa_mineralizacao_ano_2?: number;
    taxa_mineralizacao_ano_3?: number;
    taxa_mineralizacao_primeiro_ano_percentual?: number | null;
    taxa_mineralizacao_segundo_ano_percentual?: number | null;
    taxa_mineralizacao_terceiro_ano_percentual?: number | null;
    taxa_mineralizacao_quarto_ano_percentual?: number | null;
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
}

// POST /register
export interface GreenFertilizerCreateRequestDto {
    publico?: boolean;
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
    nome_adubo: string;
    umidade_incorporacao_percentual?: number | null;
    c: number;
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
    produtividade_esperada: number;
    taxa_mineralizacao_ano_1: number;
    taxa_mineralizacao_ano_2: number;
    taxa_mineralizacao_ano_3: number;
    taxa_mineralizacao_quarto_ano_percentual?: number | null;
}

// PUT /update (prefixo "novo_")
export interface GreenFertilizerPostRequestDto {
    novo_publico?: boolean;
    novos_ids_fotos?: FertilizerPhotoIds;
    novo_observacao?: string;
    novo_fonte?: string;
    novo_nome_adubo: string;
    novo_umidade_incorporacao_percentual?: number | null;
    novo_c: number;
    novo_n: number;
    novo_p2o5: number;
    novo_k2o: number;
    novo_ca: number;
    novo_mg: number;
    novo_s: number;
    novo_b: number;
    novo_cu: number;
    novo_fe: number;
    novo_mn: number;
    novo_mo: number;
    novo_zn: number;
    novo_produtividade_esperada: number;
    novo_taxa_mineralizacao_ano_1: number;
    novo_taxa_mineralizacao_ano_2: number;
    novo_taxa_mineralizacao_ano_3: number;
    novo_taxa_mineralizacao_quarto_ano_percentual?: number | null;
}

// Estado do Formulário (Strings para inputs controlados)
export interface GreenFertilizerFormState {
    publico?: "sim" | "nao";
    fotoIds?: FertilizerPhotoIds;
    observacao: string;
    fonte: string;
    nome: string;
    umidadeIncorporacao: string;
    c: string;
    n: string;
    p2o5: string;
    k2o: string;
    ca: string;
    mg: string;
    s: string;
    b: string;
    cu: string;
    fe: string;
    mn: string;
    mo: string;
    zn: string;
    produtividadeEsperada: string;
    taxaMineralizacaoAno1: string;
    taxaMineralizacaoAno2: string;
    taxaMineralizacaoAno3: string;
    taxaMineralizacaoAno4: string;
}

export const DEFAULT_GREEN_FERTILIZER_FORM_STATE: GreenFertilizerFormState = {
    ...DEFAULT_FERTILIZER_COMMERCIAL_PRICE_FORM_FIELDS,
    nome: "",
    umidadeIncorporacao: "",
    fotoIds: [],
    observacao: "",
    fonte: "",
    c: "", n: "", p2o5: "", k2o: "",
    ca: "", mg: "", s: "",
    b: "", cu: "", fe: "", mn: "", mo: "", zn: "",
    produtividadeEsperada: "",
    taxaMineralizacaoAno1: "",
    taxaMineralizacaoAno2: "",
    taxaMineralizacaoAno3: "",
    taxaMineralizacaoAno4: "",
    publico: "nao"
};

// --- ORGANIC FERTILIZER ---

// GET /get-all
export interface OrganicFertilizerResponseDto {
    id: number;
    publico?: boolean;
    nome_criador?: string;
    nome_adubo: string;
    c: number;
    teor_umidade: number;
    teor_materia_organica?: number;
    teor_cinzas?: number;
    taxa_mineralizacao_ano_1?: number;
    taxa_mineralizacao_ano_2?: number;
    taxa_mineralizacao_ano_3?: number;
    taxa_mineralizacao_primeiro_ano_percentual?: number | null;
    taxa_mineralizacao_segundo_ano_percentual?: number | null;
    taxa_mineralizacao_terceiro_ano_percentual?: number | null;
    taxa_mineralizacao_quarto_ano_percentual?: number | null;
    arsenio_mg_kg?: number | null;
    cadmio_mg_kg?: number | null;
    cromio_mg_kg?: number | null;
    chumbo_mg_kg?: number | null;
    mercurio_mg_kg?: number | null;
    niquel_mg_kg?: number | null;
    selenio_mg_kg?: number | null;
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
}

// POST /register
export interface OrganicFertilizerCreateRequestDto {
    publico?: boolean;
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
    nome_adubo: string;
    c: number;
    teor_umidade: number;
    teor_materia_organica: number;
    taxa_mineralizacao_ano_1: number;
    taxa_mineralizacao_ano_2: number;
    taxa_mineralizacao_ano_3: number;
    taxa_mineralizacao_quarto_ano_percentual?: number | null;
    arsenio_mg_kg?: number | null;
    cadmio_mg_kg?: number | null;
    cromio_mg_kg?: number | null;
    chumbo_mg_kg?: number | null;
    mercurio_mg_kg?: number | null;
    niquel_mg_kg?: number | null;
    selenio_mg_kg?: number | null;
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
}

// PUT /update (prefixo "novo_")
export interface OrganicFertilizerPostRequestDto {
    novo_publico?: boolean;
    novos_ids_fotos?: FertilizerPhotoIds;
    novo_observacao?: string;
    novo_fonte?: string;
    novo_nome_adubo: string;
    novo_c: number;
    novo_teor_umidade: number;
    novo_teor_materia_organica: number;
    novo_taxa_mineralizacao_ano_1: number;
    novo_taxa_mineralizacao_ano_2: number;
    novo_taxa_mineralizacao_ano_3: number;
    novo_taxa_mineralizacao_quarto_ano_percentual?: number | null;
    novo_arsenio_mg_kg?: number | null;
    novo_cadmio_mg_kg?: number | null;
    novo_cromio_mg_kg?: number | null;
    novo_chumbo_mg_kg?: number | null;
    novo_mercurio_mg_kg?: number | null;
    novo_niquel_mg_kg?: number | null;
    novo_selenio_mg_kg?: number | null;
    novo_n: number;
    novo_p2o5: number;
    novo_k2o: number;
    novo_ca: number;
    novo_mg: number;
    novo_s: number;
    novo_b: number;
    novo_cu: number;
    novo_fe: number;
    novo_mn: number;
    novo_mo: number;
    novo_zn: number;
}

// Estado do Formulário
export interface OrganicFertilizerFormState {
    publico?: "sim" | "nao";
    fotoIds?: FertilizerPhotoIds;
    observacao: string;
    fonte: string;
    nome: string;
    c: string;
    teorUmidade: string;
    teorMateriaOrganica: string;
    taxaMineralizacaoAno1: string;
    taxaMineralizacaoAno2: string;
    taxaMineralizacaoAno3: string;
    taxaMineralizacaoAno4: string;
    arsenio: string;
    cadmio: string;
    cromio: string;
    chumbo: string;
    mercurio: string;
    niquel: string;
    selenio: string;
    n: string;
    p2o5: string;
    k2o: string;
    ca: string;
    mg: string;
    s: string;
    b: string;
    cu: string;
    fe: string;
    mn: string;
    mo: string;
    zn: string;
}

export const DEFAULT_ORGANIC_FERTILIZER_FORM_STATE: OrganicFertilizerFormState = {
    ...DEFAULT_FERTILIZER_COMMERCIAL_PRICE_FORM_FIELDS,
    nome: "",
    fotoIds: [],
    observacao: "",
    fonte: "",
    c: "",
    teorUmidade: "", teorMateriaOrganica: "",
    taxaMineralizacaoAno1: "",
    taxaMineralizacaoAno2: "",
    taxaMineralizacaoAno3: "",
    taxaMineralizacaoAno4: "",
    arsenio: "", cadmio: "", cromio: "", chumbo: "",
    mercurio: "", niquel: "", selenio: "",
    n: "", p2o5: "", k2o: "",
    ca: "", mg: "", s: "",
    b: "", cu: "", fe: "", mn: "", mo: "", zn: "",
    publico: "nao"
};

// --- FOLIAR MINERAL FERTILIZER ---

export type FertilizerPhysicalNature = "SOLIDO" | "LIQUIDO";

// GET /get-all
export interface MineralFertilizerResponseDto {
    id: number;
    publico?: boolean;
    nome_criador?: string;
    nome_adubo: string;
    natureza_fisica?: FertilizerPhysicalNature;
    densidade_g_ml?: number;
    concentracao_volume_g_l?: number;
    concentracao_massa_g_kg?: number;
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
    indice_salino: number;
    indice_acidez: number;
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
}

// POST /register
export interface MineralFertilizerCreateRequestDto {
    publico?: boolean;
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
    nome_adubo: string;
    natureza_fisica?: FertilizerPhysicalNature;
    densidade_g_ml?: number;
    concentracao_volume_g_l?: number;
    concentracao_massa_g_kg?: number;
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
    indice_salino: number;
    indice_acidez: number;
}

// PUT /update (prefixo "novo_")
export interface MineralFertilizerPostRequestDto {
    novo_publico?: boolean;
    novos_ids_fotos?: FertilizerPhotoIds;
    novo_observacao?: string;
    novo_fonte?: string;
    novo_nome_adubo: string;
    nova_natureza_fisica?: FertilizerPhysicalNature;
    nova_densidade_g_ml?: number;
    nova_concentracao_volume_g_l?: number;
    nova_concentracao_massa_g_kg?: number;
    novo_n: number;
    novo_p2o5: number;
    novo_k2o: number;
    novo_ca: number;
    novo_mg: number;
    novo_s: number;
    novo_b: number;
    novo_cu: number;
    novo_fe: number;
    novo_mn: number;
    novo_mo: number;
    novo_zn: number;
    novo_indice_salino: number;
    novo_indice_acidez: number;
}

// Estado do Formulário
export interface MineralFertilizerFormState {
    publico?: "sim" | "nao";
    fotoIds?: FertilizerPhotoIds;
    observacao: string;
    fonte: string;
    nome: string;
    naturezaFisica: FertilizerPhysicalNature;
    densidade: string;
    concentracaoVolume: string;
    concentracaoMassa: string;
    n: string;
    p2o5: string;
    k2o: string;
    ca: string;
    mg: string;
    s: string;
    b: string;
    cu: string;
    fe: string;
    mn: string;
    mo: string;
    zn: string;
    indiceSalino: string;
    indiceAcidez: string;
}

export const DEFAULT_MINERAL_FERTILIZER_FORM_STATE: MineralFertilizerFormState = {
    ...DEFAULT_FERTILIZER_COMMERCIAL_PRICE_FORM_FIELDS,
    nome: "",
    fotoIds: [],
    observacao: "",
    fonte: "",
    naturezaFisica: "SOLIDO",
    densidade: "",
    concentracaoVolume: "",
    concentracaoMassa: "",
    n: "", p2o5: "", k2o: "",
    ca: "", mg: "", s: "",
    b: "", cu: "", fe: "", mn: "", mo: "", zn: "",
    indiceSalino: "", indiceAcidez: "",
    publico: "nao"
};

// --- CHELATED FERTILIZER (QUELATADOS) ---

// GET /get-all
export interface ChelatedFertilizerResponseDto {
    id: number;
    publico?: boolean;
    nome_criador?: string;
    nome_adubo: string;
    densidade_g_ml?: number;
    concentracao_volume_g_l?: number;
    concentracao_massa_g_kg?: number;
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
    indice_salino: number;
    indice_acidez: number;
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
}

// POST /register
export interface ChelatedFertilizerCreateRequestDto {
    publico?: boolean;
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
    nome_adubo: string;
    densidade_g_ml?: number;
    concentracao_volume_g_l?: number;
    concentracao_massa_g_kg?: number;
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
    indice_salino: number;
    indice_acidez: number;
}

// PUT /update (prefixo "novo_")
export interface ChelatedFertilizerPostRequestDto {
    novo_publico?: boolean;
    novos_ids_fotos?: FertilizerPhotoIds;
    novo_observacao?: string;
    novo_fonte?: string;
    novo_nome_adubo: string;
    nova_densidade_g_ml?: number;
    nova_concentracao_volume_g_l?: number;
    nova_concentracao_massa_g_kg?: number;
    novo_n: number;
    novo_p2o5: number;
    novo_k2o: number;
    novo_ca: number;
    novo_mg: number;
    novo_s: number;
    novo_b: number;
    novo_cu: number;
    novo_fe: number;
    novo_mn: number;
    novo_mo: number;
    novo_zn: number;
    novo_indice_salino: number;
    novo_indice_acidez: number;
}

// Estado do Formulário
export interface ChelatedFertilizerFormState {
    publico?: "sim" | "nao";
    fotoIds?: FertilizerPhotoIds;
    observacao: string;
    fonte: string;
    nome: string;
    densidade: string;
    concentracaoVolume: string;
    concentracaoMassa: string;
    n: string;
    p2o5: string;
    k2o: string;
    ca: string;
    mg: string;
    s: string;
    b: string;
    cu: string;
    fe: string;
    mn: string;
    mo: string;
    zn: string;
    indiceSalino: string;
    indiceAcidez: string;
}

export const DEFAULT_CHELATED_FERTILIZER_FORM_STATE: ChelatedFertilizerFormState = {
    ...DEFAULT_FERTILIZER_COMMERCIAL_PRICE_FORM_FIELDS,
    nome: "",
    fotoIds: [],
    observacao: "",
    fonte: "",
    densidade: "",
    concentracaoVolume: "",
    concentracaoMassa: "",
    n: "", p2o5: "", k2o: "",
    ca: "", mg: "", s: "",
    b: "", cu: "", fe: "", mn: "", mo: "", zn: "",
    indiceSalino: "", indiceAcidez: "",
    publico: "nao"
};

// --- BIOFERTILIZER ---

// GET /get-all
export interface BioFertilizerResponseDto {
    id: number;
    publico?: boolean;
    nome_criador?: string;
    nome_adubo: string;
    densidade_g_ml?: number;
    concentracao_volume_g_l?: number;
    concentracao_massa_g_kg?: number;
    proteinas_g_l?: number;
    aminoacidos_g_l?: number;
    amidos_g_l?: number;
    acucares_g_l?: number;
    compostos_diversos_g_l?: number;
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
    indice_salino: number;
    indice_acidez: number;
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
}

// POST /register
export interface BioFertilizerCreateRequestDto {
    publico?: boolean;
    ids_fotos?: FertilizerPhotoIds;
    observacao?: string;
    fonte?: string;
    nome_adubo: string;
    densidade_g_ml?: number;
    concentracao_volume_g_l?: number;
    concentracao_massa_g_kg?: number;
    proteinas_g_l?: number;
    aminoacidos_g_l?: number;
    amidos_g_l?: number;
    acucares_g_l?: number;
    compostos_diversos_g_l?: number;
    n: number;
    p2o5: number;
    k2o: number;
    ca: number;
    mg: number;
    s: number;
    b: number;
    cu: number;
    fe: number;
    mn: number;
    mo: number;
    zn: number;
    indice_salino: number;
    indice_acidez: number;
}

// PUT /update (prefixo "novo_")
export interface BioFertilizerPostRequestDto {
    novo_publico?: boolean;
    novos_ids_fotos?: FertilizerPhotoIds;
    novo_observacao?: string;
    novo_fonte?: string;
    novo_nome_adubo: string;
    nova_densidade_g_ml?: number;
    nova_concentracao_volume_g_l?: number;
    nova_concentracao_massa_g_kg?: number;
    novas_proteinas_g_l?: number;
    novos_aminoacidos_g_l?: number;
    novos_amidos_g_l?: number;
    novos_acucares_g_l?: number;
    novos_compostos_diversos_g_l?: number;
    novo_n: number;
    novo_p2o5: number;
    novo_k2o: number;
    novo_ca: number;
    novo_mg: number;
    novo_s: number;
    novo_b: number;
    novo_cu: number;
    novo_fe: number;
    novo_mn: number;
    novo_mo: number;
    novo_zn: number;
    novo_indice_salino: number;
    novo_indice_acidez: number;
}

// Estado do Formulário
export interface BioFertilizerFormState {
    publico?: "sim" | "nao";
    fotoIds?: FertilizerPhotoIds;
    observacao: string;
    fonte: string;
    nome: string;
    densidade: string;
    concentracaoVolume: string;
    concentracaoMassa: string;
    proteinas: string;
    aminoacidos: string;
    amidos: string;
    acucares: string;
    compostosDiversos: string;
    n: string;
    p2o5: string;
    k2o: string;
    ca: string;
    mg: string;
    s: string;
    b: string;
    cu: string;
    fe: string;
    mn: string;
    mo: string;
    zn: string;
    indiceSalino: string;
    indiceAcidez: string;
}

export const DEFAULT_BIO_FERTILIZER_FORM_STATE: BioFertilizerFormState = {
    ...DEFAULT_FERTILIZER_COMMERCIAL_PRICE_FORM_FIELDS,
    nome: "",
    fotoIds: [],
    observacao: "",
    fonte: "",
    densidade: "",
    concentracaoVolume: "",
    concentracaoMassa: "",
    proteinas: "",
    aminoacidos: "",
    amidos: "",
    acucares: "",
    compostosDiversos: "",
    n: "", p2o5: "", k2o: "",
    ca: "", mg: "", s: "",
    b: "", cu: "", fe: "", mn: "", mo: "", zn: "",
    indiceSalino: "", indiceAcidez: "",
    publico: "nao"
};

export interface SimpleMineralFertilizerResponseDto extends FertilizerCommercialPriceResponseFields {}
export interface SimpleMineralFertilizerCreateRequestDto extends FertilizerCommercialPriceCreateFields {}
export interface SimpleMineralFertilizerPostRequestDto extends FertilizerCommercialPriceUpdateFields {}
export interface SimpleMineralFertilizerFormState extends FertilizerCommercialPriceFormFields {}

export interface FormulatedMineralFertilizerResponseDto extends FertilizerCommercialPriceResponseFields {
    publico?: boolean;
    nome_criador?: string;
}
export interface FormulatedMineralFertilizerCreateRequestDto extends FertilizerCommercialPriceCreateFields {
    publico?: boolean;
}
export interface FormulatedMineralFertilizerPostRequestDto extends FertilizerCommercialPriceUpdateFields {
    novo_publico?: boolean;
}
export interface FormulatedFertilizerFormState extends FertilizerCommercialPriceFormFields {
    publico?: "sim" | "nao";
}

export interface OrganoMineralFertilizerResponseDto extends FertilizerCommercialPriceResponseFields {}
export interface OrganoMineralFertilizerCreateRequestDto extends FertilizerCommercialPriceCreateFields {}
export interface OrganoMineralFertilizerPostRequestDto extends FertilizerCommercialPriceUpdateFields {}
export interface OrganoMineralFertilizerFormState extends FertilizerCommercialPriceFormFields {}

export interface GreenFertilizerResponseDto extends FertilizerCommercialPriceResponseFields {}
export interface GreenFertilizerCreateRequestDto extends FertilizerCommercialPriceCreateFields {}
export interface GreenFertilizerPostRequestDto extends FertilizerCommercialPriceUpdateFields {}
export interface GreenFertilizerFormState extends FertilizerCommercialPriceFormFields {}

export interface OrganicFertilizerResponseDto extends FertilizerCommercialPriceResponseFields {}
export interface OrganicFertilizerCreateRequestDto extends FertilizerCommercialPriceCreateFields {}
export interface OrganicFertilizerPostRequestDto extends FertilizerCommercialPriceUpdateFields {}
export interface OrganicFertilizerFormState extends FertilizerCommercialPriceFormFields {}

export interface MineralFertilizerResponseDto extends FertilizerCommercialPriceResponseFields {}
export interface MineralFertilizerCreateRequestDto extends FertilizerCommercialPriceCreateFields {}
export interface MineralFertilizerPostRequestDto extends FertilizerCommercialPriceUpdateFields {}
export interface MineralFertilizerFormState extends FertilizerCommercialPriceFormFields {}

export interface ChelatedFertilizerResponseDto extends FertilizerCommercialPriceResponseFields {}
export interface ChelatedFertilizerCreateRequestDto extends FertilizerCommercialPriceCreateFields {}
export interface ChelatedFertilizerPostRequestDto extends FertilizerCommercialPriceUpdateFields {}
export interface ChelatedFertilizerFormState extends FertilizerCommercialPriceFormFields {}

export interface BioFertilizerResponseDto extends FertilizerCommercialPriceResponseFields {}
export interface BioFertilizerCreateRequestDto extends FertilizerCommercialPriceCreateFields {}
export interface BioFertilizerPostRequestDto extends FertilizerCommercialPriceUpdateFields {}
export interface BioFertilizerFormState extends FertilizerCommercialPriceFormFields {}
