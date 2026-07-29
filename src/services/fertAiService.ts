import axios, { AxiosError, CanceledError } from "axios";

import type {
  FertAiChatRequest,
  FertAiChatResponse,
} from "@/interfaces/FertAi";

const fertAiApiUrl = import.meta.env.VITE_FERT_AI_API_URL?.trim();

const fertAiApi = axios.create({
  baseURL: fertAiApiUrl,
  timeout: 45_000,
  headers: {
    "Content-Type": "application/json",
  },
});

fertAiApi.interceptors.request.use((request) => {
  const token = sessionStorage.getItem("fertintelligenceToken");
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

export type FertAiErrorCode =
  | "ABORTED"
  | "CONFIGURATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "TOO_LARGE"
  | "VALIDATION"
  | "RATE_LIMIT"
  | "TIMEOUT"
  | "UNAVAILABLE";

export class FertAiRequestError extends Error {
  constructor(
    public readonly code: FertAiErrorCode,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "FertAiRequestError";
  }
}

const mapFertAiError = (error: unknown): FertAiRequestError => {
  if (error instanceof CanceledError || axios.isCancel(error)) {
    return new FertAiRequestError("ABORTED", "Solicitação cancelada.");
  }

  const axiosError = error as AxiosError;
  if (axiosError.code === "ECONNABORTED") {
    return new FertAiRequestError(
      "TIMEOUT",
      "O Fert-IA demorou mais que o esperado para responder.",
    );
  }

  const status = axiosError.response?.status;
  if (status === 401) {
    return new FertAiRequestError(
      "UNAUTHORIZED",
      "Sua sessão expirou. Entre novamente.",
      status,
    );
  }
  if (status === 403) {
    return new FertAiRequestError("FORBIDDEN", "Acesso ao Fert-IA negado.", status);
  }
  if (status === 413) {
    return new FertAiRequestError(
      "TOO_LARGE",
      "A recomendação selecionada é grande demais para ser processada pelo Fert-IA.",
      status,
    );
  }
  if (status === 422) {
    return new FertAiRequestError(
      "VALIDATION",
      "A pergunta ou o contexto enviado não é válido.",
      status,
    );
  }
  if (status === 429) {
    return new FertAiRequestError(
      "RATE_LIMIT",
      "O limite temporário do Fert-IA foi atingido. Tente novamente mais tarde.",
      status,
    );
  }
  return new FertAiRequestError(
    "UNAVAILABLE",
    "O Fert-IA está temporariamente indisponível. Tente novamente.",
    status,
  );
};

export async function sendFertAiMessage(
  payload: FertAiChatRequest,
  signal?: AbortSignal,
): Promise<FertAiChatResponse> {
  if (!fertAiApiUrl) {
    throw new FertAiRequestError(
      "CONFIGURATION",
      "O endereço do Fert-IA não está configurado.",
    );
  }

  try {
    const { data } = await fertAiApi.post<FertAiChatResponse>(
      "/api/ai/chat",
      payload,
      { signal },
    );
    return data;
  } catch (error) {
    if (error instanceof FertAiRequestError) throw error;
    throw mapFertAiError(error);
  }
}
