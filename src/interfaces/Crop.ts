// Tipagem para o Objeto de Valor 'Date' do Java
// Baseado no com.migueltcc.fertintelligence.composedAttributes.crop.Date
export interface CropDate {
    day: number;
    month: number;
    year: number;
  }
  
  // Enum para Tipo de Cultivo
  // Baseado no com.migueltcc.fertintelligence.composedAttributes.crop.CultivationType
  export type CultivationType = 'SAFRA' | 'SAFRINHA';
  
  // Enum para Nome Comum
  // Baseado no com.migueltcc.fertintelligence.composedAttributes.fertilizationTables.NomeComum
  export type NomeComum = 
    | 'ALGODAO'
    | 'AMENDOIM'
    | 'CANA_DE_ACUCAR'
    | 'FEIJAO_CAUPI'
    | 'FEIJAO_COMUM'
    | 'GERGELIM'
    | 'MAMONA'
    | 'MILHO'
    | 'SISAL'
    | 'SOJA';

  export type PlantSpacingMode = 'plants_per_meter' | 'holes';
  
  export interface CropResponseDto {
    id: number;
    id_pasta?: number; // Campo inferido (no backend DTO pode vir como folder_id ou apenas vinculado)
    
    // Dados Principais
    tipo_cultivo: CultivationType;
    nome: NomeComum;
    variedade: string;
    ciclo: number; // dias
    
    // Parâmetros Técnicos
    distancia_entre_linhas: number;
    numero_plantas_por_metro: number;
    modo_espacamento?: PlantSpacingMode | null;
    distancia_entre_plantas?: number | null;
    numero_plantas_por_cova?: number | null;
    
    // Produtividade
    produtividade_esperada: number;
    produtividade_obtida: number;
    area_usada_no_talhao: number;
    
    // Datas (Objetos complexos {day, month, year})
    data_plantio: CropDate;
    data_emergencia: CropDate;
    data_botonamento: CropDate;
    data_florescimento: CropDate;
    data_colheita: CropDate;
    idfoto?: string;
  }
  
  export interface CropCreateRequestDto {
    tipo_cultivo: CultivationType;
    nome: NomeComum;
    variedade: string;
    ciclo: number;
    
    distancia_entre_linhas: number;
    numero_plantas_por_metro: number;
    modo_espacamento?: PlantSpacingMode;
    distancia_entre_plantas?: number | null;
    numero_plantas_por_cova?: number | null;
    
    produtividade_esperada: number;
    produtividade_obtida: number;
    area_usada_no_talhao: number;
    
    data_plantio: CropDate;
    data_emergencia: CropDate;
    data_botonamento: CropDate;
    data_florescimento: CropDate;
    data_colheita: CropDate;
    idfoto?: string;
  }
  
  export interface CropPostRequestDto {
    // Nota: No DTO de Update (PostRequest), as propriedades têm o prefixo 'novo_'
    novo_tipo_cultivo?: CultivationType;
    novo_nome?: NomeComum;
    novo_variedade?: string;
    novo_ciclo?: number;
    
    novo_distancia_entre_linhas?: number;
    novo_numero_plantas_por_metro?: number;
    novo_modo_espacamento?: PlantSpacingMode;
    novo_distancia_entre_plantas?: number | null;
    novo_numero_plantas_por_cova?: number | null;
    
    novo_produtividade_esperada?: number;
    novo_produtividade_obtida?: number;
    novo_area_usada_no_talhao?: number;
    
    novo_data_plantio?: CropDate;
    novo_data_emergencia?: CropDate;
    novo_data_botonamento?: CropDate;
    novo_data_florescimento?: CropDate;
    novo_data_colheita?: CropDate;
    novo_idfoto?: string;
  }
