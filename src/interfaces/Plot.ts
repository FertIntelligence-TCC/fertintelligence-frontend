// src/interfaces/Plot.ts

export enum ClasseSolo {
    ARGISSOLO = "ARGISSOLO",
    LATOSSOLO = "LATOSSOLO",
    NEOSSOLO = "NEOSSOLO",
    CAMBISSOLO = "CAMBISSOLO",
    CHERNOSSOLO = "CHERNOSSOLO",
    ESPEDOSSOLO = "ESPEDOSSOLO",
    GLEISSOLO = "GLEISSOLO",
    LUVISSOLO = "LUVISSOLO",
    NITOSSOLO = "NITOSSOLO",
    ORGANOSSOLO = "ORGANOSSOLO",
    PLANOSSOLO = "PLANOSSOLO",
    PLINTOSSOLO = "PLINTOSSOLO",
    VERTISSOLO = "VERTISSOLO"
}

export enum TexturaSolo {
    AREIA = "AREIA",
    AREIA_FRANCA = "AREIA_FRANCA",
    FRANCO_ARENOSO = "FRANCO_ARENOSO",
    FRANCO_ARGILOSO_ARENOSA = "FRANCO_ARGILOSO_ARENOSA",
    ARGILO_ARENOSA = "ARGILO_ARENOSA",
    MUITO_ARENOSA = "MUITO_ARENOSA",
    ARGILA = "ARGILA",
    FRANCO_ARGILOSA = "FRANCO_ARGILOSA",
    FRANCA = "FRANCA",
    ARGILO_SILTOSA = "ARGILO_SILTOSA",
    FRANCO_ARGILO_SILTOSA = "FRANCO_ARGILO_SILTOSA",
    FRANCO_SILTOSA = "FRANCO_SILTOSA",
    SILTE = "SILTE"
}

export enum AreaIrrigada {
    SIM = "SIM",
    NAO = "NAO"
}

export interface PlotResponse {
    id: number;
    identificacao: string;
    area: number;
    classe_solo: ClasseSolo;
    textura_solo: TexturaSolo;
    ano_incorporacao_safra: number;
    area_irrigada: AreaIrrigada;
    declividade: number;
    pluviosidade_mensal: number;
    pluviosidade_anual: number;
}

export interface PlotCreatePayload {
    identificacao: string;
    area: number;
    classe_solo: ClasseSolo;
    textura_solo: TexturaSolo;
    ano_incorporacao_safra: number;
    area_irrigada: AreaIrrigada;
    declividade: number;
    pluviosidade_mensal: number;
    pluviosidade_anual: number;
}

export interface PlotUpdatePayload {
    nova_identificacao?: string;
    nova_area?: number;
    nova_classe_solo?: ClasseSolo;
    nova_textura_solo?: TexturaSolo;
    novo_ano_incorporacao_safra?: number;
    nova_area_irrigada?: AreaIrrigada;
    nova_declividade?: number;
    nova_pluviosidade_mensal?: number;
    nova_pluviosidade_anual?: number;
}