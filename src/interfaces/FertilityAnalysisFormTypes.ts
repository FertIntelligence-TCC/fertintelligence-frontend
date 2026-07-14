import { Camada } from "./LayerExtract";

export type AnalysisMode = 'INITIAL' | 'LAYER' | 'RANGE';

/**
 * Representa os dados de um extrato no formulário de Análise de Fertilidade.
 * Combina dados de controle visual, dados do extrato (profundidade/camada)
 * e os dados químicos mapeados do backend.
 */
export interface FertilityExtractFormData {
    // Controles do Frontend
    tempId: string;       // ID temporário para manipulação na lista visual
    databaseId?: number;  // ID real no banco (ID da tabela de fertilidade)
    containerId?: number; // <--- NOVO: ID do container (LayerExtract ou RangeExtract)

    // Dados do Extrato (Container)
    profundidadeInicial: number;
    profundidadeFinal: number;
    camada?: Camada;      // Apenas se mode === 'LAYER'
    subcamada?: number;   // Calculado automaticamente

    // Dados Químicos (Mapeados de FertilityAnalysisExtractModel)
    phAgua: number;
    phCacl2: number;
    
    // Macro e Secundários
    calcio: number;
    magnesio: number;
    potassio: number;
    enxofre: number;
    
    // Micro e Outros
    sodio: number;
    aluminio: number;
    aluminioMaisHidrogenio: number;
    
    // Complexo de Troca / valores calculados pelo backend
    somaBases?: number | null;
    ctcEfetiva?: number | null;
    ctcPh7?: number | null;
    saturacaoBasesV?: number | null;
    saturacaoAluminioM?: number | null;
    pst?: number | null;
    saturacaoPotassioCtc?: number | null;
    saturacaoSodioCtc?: number | null;
    saturacaoCalcioCtc?: number | null;
    saturacaoMagnesioCtc?: number | null;
    saturacaoHidrogenioCtc?: number | null;
    saturacaoAluminioCtc?: number | null;
    relacaoCalcioMagnesio?: number | null;
    relacaoCalcioPotassio?: number | null;
    relacaoMagnesioPotassio?: number | null;
    relacaoCalcioMagnesioPotassio?: number | null;
    
    // Fósforo e MO
    fosforoMehlich1: number;
    fosforoResina: number;
    materiaOrganica: number;
    
    // Micronutrientes
    boro: number | string | null;
    cobre: number | string | null;
    ferro: number | string | null;
    manganes: number | string | null;
    zinco: number | string | null;
}
