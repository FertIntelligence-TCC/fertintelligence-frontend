import { FertigramResponse } from "@/interfaces/Fertigram";
import { api } from "./axios";

import { ENDPOINT } from "@/constants/Endpoint";

export const generateFertigram = async (
  foliarAnalysisId: number,
  tableId: number
): Promise<FertigramResponse> => {
  const { data } = await api.get<FertigramResponse>(`${ENDPOINT.FERTIGRAM}/generate`, {
    params: { foliarAnalysisId, tableId },
  });

  return {
    ...data,
    macronutrients: data.macronutrients ?? [],
    micronutrients: data.micronutrients ?? [],
  };
};
