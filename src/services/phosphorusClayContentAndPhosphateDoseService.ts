import { AxiosError } from "axios";
import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import {
  PhosphorusClayContentAndPhosphateDoseCreateRequestDto,
  PhosphorusClayContentAndPhosphateDosePostRequestDto,
  PhosphorusClayContentAndPhosphateDoseResponseDto
} from "@/interfaces/PhosphorusClayContentAndPhosphateDose";

const isNotFound = (error: unknown) =>
  error instanceof AxiosError && error.response?.status === 404;

type FlatPhosphorusPayload = Record<string, number | string | null | undefined>;

type PhosphorusSection = Record<string, number | null | undefined>;

const mapSectionToFlatPayload = (
  section: PhosphorusSection,
  system: "sequeiro" | "irrigado"
) => ({
  [`menor_teor_argila_${system}`]: section?.menor_teor_argila ?? null,
  [`menor_teor_argila_primeiro_intervalo_${system}`]:
    section?.intervalo_1_menor_teor_argila ?? null,
  [`maior_teor_argila_primeiro_intervalo_${system}`]:
    section?.intervalo_1_maior_teor_argila ?? null,
  [`menor_teor_argila_segundo_intervalo_${system}`]:
    section?.intervalo_2_menor_teor_argila ?? null,
  [`maior_teor_argila_segundo_intervalo_${system}`]:
    section?.intervalo_2_maior_teor_argila ?? null,
  [`maior_teor_argila_${system}`]: section?.maior_teor_argila ?? null,

  [`dose_p2o5_teor_p_muito_baixo_menor_teor_argila_${system}`]:
    section?.menor_teor_argila_dose_p_muito_baixo ?? null,
  [`dose_p2o5_teor_p_baixa_menor_teor_argila_${system}`]:
    section?.menor_teor_argila_dose_p_baixo ?? null,
  [`dose_p2o5_teor_p_media_menor_teor_argila_${system}`]:
    section?.menor_teor_argila_dose_p_medio ?? null,

  [`dose_p2o5_teor_p_muito_baixo_primeiro_intervalo_${system}`]:
    section?.intervalo_1_dose_p_muito_baixo ?? null,
  [`dose_p2o5_teor_p_baixa_primeiro_intervalo_${system}`]:
    section?.intervalo_1_dose_p_baixo ?? null,
  [`dose_p2o5_teor_p_media_primeiro_intervalo_${system}`]:
    section?.intervalo_1_dose_p_medio ?? null,

  [`dose_p2o5_teor_p_muito_baixo_segundo_intervalo_${system}`]:
    section?.intervalo_2_dose_p_muito_baixo ?? null,
  [`dose_p2o5_teor_p_baixa_segundo_intervalo_${system}`]:
    section?.intervalo_2_dose_p_baixo ?? null,
  [`dose_p2o5_teor_p_media_segundo_intervalo_${system}`]:
    section?.intervalo_2_dose_p_medio ?? null,

  [`dose_p2o5_teor_p_muito_baixo_maior_teor_argila_${system}`]:
    section?.maior_teor_argila_dose_p_muito_baixo ?? null,
  [`dose_p2o5_teor_p_baixa_maior_teor_argila_${system}`]:
    section?.maior_teor_argila_dose_p_baixo ?? null,
  [`dose_p2o5_teor_p_media_maior_teor_argila_${system}`]:
    section?.maior_teor_argila_dose_p_medio ?? null
});

const mapResponseToFlatPayload = (
  data: Record<string, any>
): PhosphorusClayContentAndPhosphateDoseResponseDto =>
  ({
    id: data.id,
    id_tabela: data.id_tabela,
    ...mapSectionToFlatPayload(data.sistemas_sequeiro, "sequeiro"),
    ...mapSectionToFlatPayload(data.sistemas_irrigados, "irrigado"),
    observacoes: data.observacoes,
    fontes: data.fontes
  }) as PhosphorusClayContentAndPhosphateDoseResponseDto;

const buildSectionPayload = (
  payload: FlatPhosphorusPayload,
  system: "sequeiro" | "irrigado",
  prefix = ""
) => ({
  menor_teor_argila: payload[`${prefix}menor_teor_argila_${system}`],

  menor_teor_argila_dose_p_muito_baixo:
    payload[`${prefix}dose_p2o5_teor_p_muito_baixo_menor_teor_argila_${system}`],
  menor_teor_argila_dose_p_baixo:
    payload[`${prefix}dose_p2o5_teor_p_baixa_menor_teor_argila_${system}`],
  menor_teor_argila_dose_p_medio:
    payload[`${prefix}dose_p2o5_teor_p_media_menor_teor_argila_${system}`],

  intervalo_1_menor_teor_argila:
    payload[`${prefix}menor_teor_argila_primeiro_intervalo_${system}`],
  intervalo_1_maior_teor_argila:
    payload[`${prefix}maior_teor_argila_primeiro_intervalo_${system}`],
  intervalo_1_dose_p_muito_baixo:
    payload[`${prefix}dose_p2o5_teor_p_muito_baixo_primeiro_intervalo_${system}`],
  intervalo_1_dose_p_baixo:
    payload[`${prefix}dose_p2o5_teor_p_baixa_primeiro_intervalo_${system}`],
  intervalo_1_dose_p_medio:
    payload[`${prefix}dose_p2o5_teor_p_media_primeiro_intervalo_${system}`],

  intervalo_2_menor_teor_argila:
    payload[`${prefix}menor_teor_argila_segundo_intervalo_${system}`],
  intervalo_2_maior_teor_argila:
    payload[`${prefix}maior_teor_argila_segundo_intervalo_${system}`],
  intervalo_2_dose_p_muito_baixo:
    payload[`${prefix}dose_p2o5_teor_p_muito_baixo_segundo_intervalo_${system}`],
  intervalo_2_dose_p_baixo:
    payload[`${prefix}dose_p2o5_teor_p_baixa_segundo_intervalo_${system}`],
  intervalo_2_dose_p_medio:
    payload[`${prefix}dose_p2o5_teor_p_media_segundo_intervalo_${system}`],

  maior_teor_argila: payload[`${prefix}maior_teor_argila_${system}`],
  maior_teor_argila_dose_p_muito_baixo:
    payload[`${prefix}dose_p2o5_teor_p_muito_baixo_maior_teor_argila_${system}`],
  maior_teor_argila_dose_p_baixo:
    payload[`${prefix}dose_p2o5_teor_p_baixa_maior_teor_argila_${system}`],
  maior_teor_argila_dose_p_medio:
    payload[`${prefix}dose_p2o5_teor_p_media_maior_teor_argila_${system}`]
});

const mapCreatePayloadToBackend = (
  payload: PhosphorusClayContentAndPhosphateDoseCreateRequestDto
) => ({
  sistemas_sequeiro: buildSectionPayload(payload, "sequeiro"),
  sistemas_irrigados: buildSectionPayload(payload, "irrigado"),
  observacoes: payload.observacoes,
  fontes: payload.fontes
});

const mapUpdatePayloadToBackend = (
  payload: PhosphorusClayContentAndPhosphateDosePostRequestDto
) => ({
  novo_sistemas_sequeiro: buildSectionPayload(payload, "sequeiro", "novo_"),
  novo_sistemas_irrigados: buildSectionPayload(payload, "irrigado", "novo_"),
  novo_observacoes: payload.novo_observacoes,
  novo_fontes: payload.novo_fontes
});

export const getPhosphorusClayContentAndPhosphateDoseByTable = async (
  tableId: number
): Promise<PhosphorusClayContentAndPhosphateDoseResponseDto | null> => {
  try {
    const { data } = await api.get(
      ENDPOINT.GET_BY_TABLE_PHOSPHORUS_CLAY_CONTENT_AND_PHOSPHATE_DOSE,
      { params: { tableId } }
    );
    return mapResponseToFlatPayload(data);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
};

export const createPhosphorusClayContentAndPhosphateDose = async (
  tableId: number,
  payload: PhosphorusClayContentAndPhosphateDoseCreateRequestDto
) => {
  const { data } = await api.post(
    ENDPOINT.CREATE_PHOSPHORUS_CLAY_CONTENT_AND_PHOSPHATE_DOSE,
    mapCreatePayloadToBackend(payload),
    { params: { tableId } }
  );
  return data;
};

export const updatePhosphorusClayContentAndPhosphateDose = async (
  criterionId: number,
  payload: PhosphorusClayContentAndPhosphateDosePostRequestDto
) => {
  const { data } = await api.put(
    ENDPOINT.UPDATE_PHOSPHORUS_CLAY_CONTENT_AND_PHOSPHATE_DOSE,
    mapUpdatePayloadToBackend(payload),
    { params: { criterionId } }
  );
  return data;
};
