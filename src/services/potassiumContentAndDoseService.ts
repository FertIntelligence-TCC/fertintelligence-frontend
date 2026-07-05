import { AxiosError } from "axios";
import { ENDPOINT } from "@/constants/Endpoint";
import { api } from "./axios";
import {
  PotassiumContentAndDoseCreateRequestDto,
  PotassiumContentAndDosePostRequestDto,
  PotassiumContentAndDoseResponseDto
} from "@/interfaces/PotassiumContentAndDose";

const isNotFound = (error: unknown) =>
  error instanceof AxiosError && error.response?.status === 404;

const mapSectionToFlatPayload = (
  section: any,
  suffix: "ctc_menor_40" | "ctc_maior_igual_40"
) => ({
  [`teor_baixo_menor_${suffix}`]: section?.teor_baixo_menor_que ?? null,
  [`dose_teor_baixo_${suffix}`]: section?.dose_para_teor_baixo ?? null,
  [`medio_menor_teor_${suffix}`]: section?.medio_menor_teor ?? null,
  [`medio_maior_teor_${suffix}`]: section?.medio_maior_teor ?? null,
  [`dose_teor_medio_${suffix}`]: section?.dose_para_teor_medio ?? null,
  [`adequado_menor_teor_${suffix}`]: section?.adequado_menor_teor ?? null,
  [`adequado_maior_teor_${suffix}`]: section?.adequado_maior_teor ?? null,
  [`dose_teor_adequado_${suffix}`]: section?.dose_para_teor_adequado ?? null,
  [`teor_alto_maior_${suffix}`]: section?.teor_alto_maior_que ?? null,
  [`dose_teor_alto_${suffix}`]: section?.dose_para_teor_alto ?? null
});

const mapResponseToFlatPayload = (data: any): PotassiumContentAndDoseResponseDto => ({
  id: data.id,
  id_tabela: data.id_tabela,
  ...mapSectionToFlatPayload(data.ctc_ph_7_menor_40, "ctc_menor_40"),
  ...mapSectionToFlatPayload(data.ctc_ph_7_maior_igual_40, "ctc_maior_igual_40"),
  observacoes: data.observacoes,
  fontes: data.fontes
} as PotassiumContentAndDoseResponseDto);

type FlatPotassiumPayload = Record<string, number | string | null | undefined>;

const buildSectionPayload = (
  payload: FlatPotassiumPayload,
  suffix: "ctc_menor_40" | "ctc_maior_igual_40",
  prefix = ""
) => ({
  teor_baixo_menor_que: payload[`${prefix}teor_baixo_menor_${suffix}`],
  dose_para_teor_baixo: payload[`${prefix}dose_teor_baixo_${suffix}`],
  medio_menor_teor: payload[`${prefix}medio_menor_teor_${suffix}`],
  medio_maior_teor: payload[`${prefix}medio_maior_teor_${suffix}`],
  dose_para_teor_medio: payload[`${prefix}dose_teor_medio_${suffix}`],
  adequado_menor_teor: payload[`${prefix}adequado_menor_teor_${suffix}`],
  adequado_maior_teor: payload[`${prefix}adequado_maior_teor_${suffix}`],
  dose_para_teor_adequado: payload[`${prefix}dose_teor_adequado_${suffix}`],
  teor_alto_maior_que: payload[`${prefix}teor_alto_maior_${suffix}`],
  dose_para_teor_alto: payload[`${prefix}dose_teor_alto_${suffix}`]
});

const mapCreatePayloadToBackend = (payload: PotassiumContentAndDoseCreateRequestDto) => ({
  ctc_ph_7_menor_40: buildSectionPayload(payload, "ctc_menor_40"),
  ctc_ph_7_maior_igual_40: buildSectionPayload(payload, "ctc_maior_igual_40"),
  observacoes: payload.observacoes,
  fontes: payload.fontes
});

const mapUpdatePayloadToBackend = (payload: PotassiumContentAndDosePostRequestDto) => ({
  novo_ctc_ph_7_menor_40: buildSectionPayload(payload, "ctc_menor_40", "novo_"),
  novo_ctc_ph_7_maior_igual_40: buildSectionPayload(payload, "ctc_maior_igual_40", "novo_"),
  novo_observacoes: payload.novo_observacoes,
  novo_fontes: payload.novo_fontes
});

export const getPotassiumContentAndDoseByTable = async (
  tableId: number
): Promise<PotassiumContentAndDoseResponseDto | null> => {
  try {
    const { data } = await api.get(ENDPOINT.GET_BY_TABLE_POTASSIUM_CONTENT_AND_DOSE, {
      params: { tableId }
    });
    return mapResponseToFlatPayload(data);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
};

export const createPotassiumContentAndDose = async (
  tableId: number,
  payload: PotassiumContentAndDoseCreateRequestDto
) => {
  const { data } = await api.post(
    ENDPOINT.CREATE_POTASSIUM_CONTENT_AND_DOSE,
    mapCreatePayloadToBackend(payload),
    { params: { tableId } }
  );
  return data;
};

export const updatePotassiumContentAndDose = async (
  criterionId: number,
  payload: PotassiumContentAndDosePostRequestDto
) => {
  const { data } = await api.put(
    ENDPOINT.UPDATE_POTASSIUM_CONTENT_AND_DOSE,
    mapUpdatePayloadToBackend(payload),
    { params: { criterionId } }
  );
  return data;
};
