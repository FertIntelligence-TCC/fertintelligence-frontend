// src/interfaces/Fertilizer.ts

// --- ADUBOS MINERAIS SIMPLES ---

// GET /get-all
export interface SimpleMineralFertilizerResponseDto {
    id: number;
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
}

// POST /register
export interface SimpleMineralFertilizerCreateRequestDto {
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
    nome: "",
    n: "", p2o5: "", k2o: "",
    ca: "", mg: "", s: "",
    b: "", cu: "", fe: "", mn: "", mo: "", zn: "",
    indiceSalino: "", indiceAcidez: ""
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
    formulate: FormulateDto;
    relation: NPKRelationDto;
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
}

// POST /register
export interface FormulatedMineralFertilizerCreateRequestDto {
    formulate: FormulateDto;
    relation: NPKRelationDto;
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
    novo_formulate: FormulateDto;
    novo_relation: NPKRelationDto;
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
    formulaN: "", formulaP: "", formulaK: "",
    relacaoN: "", relacaoP: "", relacaoK: "",
    n: "", p2o5: "", k2o: "",
    ca: "", mg: "", s: "",
    b: "", cu: "", fe: "", mn: "", mo: "", zn: "",
    numeroFormulaIndicada: ""
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

export interface SimpleMineralFertilizerCreateRequestDto {
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
}

// POST /register
export interface FormulatedMineralFertilizerCreateRequestDto {
    formula: FormulateDto;   // CORRIGIDO
    relacao: NPKRelationDto; // CORRIGIDO
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
}

// POST /register
export interface OrganoMineralFertilizerCreateRequestDto {
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
}

// PUT /update (prefixo "novo_")
export interface OrganoMineralFertilizerPostRequestDto {
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
}

// Estado do Formulário
export interface OrganoMineralFertilizerFormState {
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
}

export const DEFAULT_ORGANO_MINERAL_FORM_STATE: OrganoMineralFertilizerFormState = {
    nome: "",
    c: "", n: "", p2o5: "", k2o: "",
    ca: "", mg: "", s: "",
    b: "", cu: "", fe: "", mn: "", mo: "", zn: "",
    indiceSalino: "", indiceAcidez: ""
};