import { describe, expect, it } from "vitest";

import { buildRecommendationCreatePayload } from "./recommendationService";

describe("rótulo da origem dos adubos", () => {
  it("mantém o contrato e o valor do payload após a alteração textual", () => {
    const payload = buildRecommendationCreatePayload({
      recommendationType: "FERTILIZATION",
      propertyId: 1,
      plotId: 2,
      physicalAnalysisId: 3,
      fertilityAnalysisId: 4,
      annualCropFolderId: 5,
      cropId: 6,
      cropFertilizationTableId: 7,
      soilFertilityInterpretationTableId: 8,
      cropFertilizationTableGroup: "PUBLIC",
      soilFertilityInterpretationTableGroup: "PUBLIC",
      fertilizerSourceOption: "ALL",
    });

    expect(payload.origem_adubos).toBe("ALL");
    expect(payload).not.toHaveProperty("relacao_adubos");
  });

  it("normaliza somente os novos campos opcionais de identificação", () => {
    const base = {
      recommendationType: "FERTILIZATION" as const,
      propertyId: 1,
      plotId: 2,
      physicalAnalysisId: 3,
      fertilityAnalysisId: 4,
      annualCropFolderId: 5,
      cropId: 6,
      cropFertilizationTableId: 7,
      soilFertilityInterpretationTableId: 8,
      cropFertilizationTableGroup: "PUBLIC" as const,
      soilFertilityInterpretationTableGroup: "PUBLIC" as const,
      fertilizerSourceOption: "ALL" as const,
    };

    expect(buildRecommendationCreatePayload({
      ...base,
      reportMunicipality: "  Campina Grande ",
      reportState: "pb",
      reportProfessionalRegistration: " CREA/PB 123 ",
    })).toMatchObject({
      municipio_relatorio: "Campina Grande",
      uf_relatorio: "PB",
      registro_profissional_relatorio: "CREA/PB 123",
    });

    expect(buildRecommendationCreatePayload({
      ...base,
      reportMunicipality: " ",
      reportState: "",
      reportProfessionalRegistration: " ",
    })).toMatchObject({
      municipio_relatorio: null,
      uf_relatorio: null,
      registro_profissional_relatorio: null,
    });
  });
});
