import { Camada } from "./LayerExtract";

export type AnalysisMode = 'INITIAL' | 'LAYER' | 'RANGE';

/**
 * Representa os dados de um extrato no formulário de Análise de Extrato de Saturação.
 * Mapeia os campos do backend (SaturationExtractAnalysisExtractModel) para o frontend.
 */
export interface SaturationExtractFormData {
    // Controles do Frontend
    tempId: string;       // ID temporário
    databaseId?: number;  // ID real (para edição)

    // Dados do Extrato (Container)
    profundidadeInicial: number;
    profundidadeFinal: number;
    camada?: Camada;
    subcamada?: number;

    // Dados Químicos da Saturação
    ph: number;
    ce: number; // Condutividade Elétrica

    // Ânions (mg/L ou meq/L dependendo da unidade, aqui assumimos numérico puro)
    teorCO3: number;
    teorHCO3: number;
    teorNO3: number;
    teorH2PO4: number;
    teorSO4: number;

    // Cátions
    teorNa: number;
    teorK: number;
    teorCa: number;
    teorMg: number;

    // Outros Parâmetros
    residuosSuspensao: number;
    durezaCaCO3: number;
    durezaTotalCaCO3: number;
    ras: number; // Razão de Adsorção de Sódio
    pst: number; // Porcentagem de Sódio Trocável
}