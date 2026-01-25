import { Camada } from "./LayerExtract";

export type AnalysisMode = 'INITIAL' | 'LAYER' | 'RANGE';

/**
 * Representa os dados de um extrato no formulário de Análise Física.
 * Combina dados de controle visual (tempId), dados do extrato (profundidade/camada)
 * e os dados físicos mapeados do backend.
 */
export interface PhysicalExtractFormData {
    // Controles do Frontend
    tempId: string;       // ID temporário para manipulação na lista
    databaseId?: number;  // ID real no banco (apenas para edição)
    containerId?: number;

    // Dados do Extrato (Container)
    profundidadeInicial: number;
    profundidadeFinal: number;
    camada?: Camada;      // Apenas se mode === 'LAYER'
    subcamada?: number;   // Calculado automaticamente ou vindo do banco

    // Dados Físicos (Mapeados de PhysicalAnalysisExtractModel.java)
    teorAreia: number;
    teorSilte: number;
    teorArgila: number;
    
    densidadeAparente: number;
    densidadeReal: number;
    
    porosidadeTotal: number;
    microporosidade: number;
    
    umidadeCapacidadeCampo: number;
    umidadePontoMurchaPermanente: number;
    aguaDisponivel: number;
    
    resistenciaPenetracao: number;
    
    // Estabilidade de Agregados
    percAgregados6_0mm: number;
    percAgregados4_1a6_0mm: number;
    percAgregados2_1a4_0mm: number;
    percAgregados1_0a2_0mm: number;
    percAgregados0_5a1_0mm: number;
    percAgregados0_25a0_5mm: number;
    percAgregadosMenor0_25mm: number;
    dmAgregados: number; // Diâmetro Médio
}