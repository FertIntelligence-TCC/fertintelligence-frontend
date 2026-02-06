// DTO recebido do Backend (GET)
export interface SalinityInterpretationResponseDto {
  id: number;
  table_id: number;
  // Solo Normal
  normal_soil_highest_ce: number;
  normal_soil_highest_pst: number;
  normal_soil_highest_ph: number;
  normal_soil_highest_ras: number;
  // Solo Salino
  saline_soil_lowest_ce: number;
  saline_soil_highest_pst: number;
  saline_soil_highest_ph: number;
  saline_soil_highest_ras: number;
  // Solo Salino-Sódico
  sodic_saline_soil_highest_ce: number;
  sodic_saline_soil_lowest_pst: number;
  sodic_saline_soil_lowest_ph: number;
  sodic_saline_soil_lowest_ras: number;
  // Solo Sódico
  sodic_soil_highest_ce: number;
  sodic_soil_lowest_pst: number;
  sodic_soil_lowest_ph: number;
  sodic_soil_lowest_ras: number;
}

// DTO para Criação (POST) - Chaves em Português conforme seu Java
export interface SalinityInterpretationCreateRequestDto {
  maior_ce_solo_normal: number;
  maior_pst_solo_normal: number;
  maior_ph_solo_normal: number;
  maior_ras_solo_normal: number;

  menor_ce_solo_salino: number;
  maior_pst_solo_salino: number;
  maior_ph_solo_salino: number;
  maior_ras_solo_salino: number;

  maior_ce_solo_salino_sodico: number;
  menor_pst_solo_salino_sodico: number;
  menor_ph_solo_salino_sodico: number;
  menor_ras_solo_salino_sodico: number;

  maior_ce_solo_sodico: number;
  menor_pst_solo_sodico: number;
  menor_ph_solo_sodico: number;
  menor_ras_solo_sodico: number;
}

// DTO para Atualização (PUT) - Chaves com prefixo "novo_"
export interface SalinityInterpretationPostRequestDto {
  novo_maior_ce_solo_normal?: number;
  novo_maior_pst_solo_normal?: number;
  novo_maior_ph_solo_normal?: number;
  novo_maior_ras_solo_normal?: number;

  novo_menor_ce_solo_salino?: number;
  novo_maior_pst_solo_salino?: number;
  novo_maior_ph_solo_salino?: number;
  novo_maior_ras_solo_salino?: number;

  novo_maior_ce_solo_salino_sodico?: number;
  novo_menor_pst_solo_salino_sodico?: number;
  novo_menor_ph_solo_salino_sodico?: number;
  novo_menor_ras_solo_salino_sodico?: number;

  novo_maior_ce_solo_sodico?: number;
  novo_menor_pst_solo_sodico?: number;
  novo_menor_ph_solo_sodico?: number;
  novo_menor_ras_solo_sodico?: number;
}
