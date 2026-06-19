import { ENDPOINT } from "@/constants/Endpoint";
import { FertigramResponse } from "@/interfaces/Fertigram";
import { api } from "./axios";


export const generateFertigram = async (
  foliarAnalysisId: number,
  tableId: number
): Promise<FertigramResponse> => {
  const { data } = await api.get<FertigramResponse>(ENDPOINT.GENERATE_FERTIGRAM, {
    params: { foliarAnalysisId, tableId },
  });

  return {
    ...data,
    macronutrients: data.macronutrients ?? [],
    micronutrients: data.micronutrients ?? [],
  };
};
