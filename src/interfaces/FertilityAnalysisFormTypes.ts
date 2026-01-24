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
    databaseId?: number;  // ID real no banco (apenas para edição futura)

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
    
    // Complexo de Troca / Calculados
    somaBases: number;
    ctcEfetiva: number;
    ctcPh7: number;
    saturacaoBasesV: number;
    saturacaoAluminioM: number;
    
    // Fósforo e MO
    fosforoMehlich1: number;
    fosforoResina: number;
    materiaOrganica: number;
    
    // Micronutrientes
    boro: number;
    cobre: number;
    ferro: number;
    manganes: number;
    zinco: number;
}