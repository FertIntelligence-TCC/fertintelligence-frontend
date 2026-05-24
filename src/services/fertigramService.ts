import { FertigramResponse } from "@/interfaces/Fertigram";
import { api } from "./axios";

const ENDPOINT = "/fertigram";

export const generateFertigram = async (
  foliarAnalysisId: number,
  tableId: number
): Promise<FertigramResponse> => {
  const { data } = await api.get<FertigramResponse>(`${ENDPOINT}/generate`, {
    params: { foliarAnalysisId, tableId },
  });

  return data;
};
