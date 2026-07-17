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
});
