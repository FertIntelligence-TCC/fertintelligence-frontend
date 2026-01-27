export interface AnnualCropFolderResponseDto {
    id: number;
    ano_culturas: number;
    id_talhao: number;
    identificacao_talhao: string;
  }
  
  export interface AnnualCropFolderCreateRequestDto {
    ano_culturas: number;
  }
  
  export interface AnnualCropFolderPostRequestDto {
    novo_ano_culturas: number;
  }