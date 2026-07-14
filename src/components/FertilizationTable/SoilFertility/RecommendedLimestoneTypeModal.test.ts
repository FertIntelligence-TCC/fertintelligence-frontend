import { describe, expect, it } from "vitest";

import {
  buildRecommendedLimestoneTypeCreatePayload,
  buildRecommendedLimestoneTypeUpdatePayload,
  RECOMMENDED_LIMESTONE_TYPE_FIELDS,
} from "./RecommendedLimestoneTypeModal";

describe("RecommendedLimestoneTypeModal contract", () => {
  const form = {
    relacao_ca_mg_baixa: "3,25",
    relacao_ca_mg_alta: "4.5",
    observacoes: "Observação preservada",
    fontes: "Fonte preservada",
  };

  it("exposes only the low and high fields with the established 5 percent boundary", () => {
    expect(RECOMMENDED_LIMESTONE_TYPE_FIELDS).toHaveLength(2);
    expect(RECOMMENDED_LIMESTONE_TYPE_FIELDS.map((field) => field.label)).toEqual([
      "Relação Ca/Mg Baixa",
      "Relação Ca/Mg Alta",
    ]);
    expect(RECOMMENDED_LIMESTONE_TYPE_FIELDS[0].legend).toContain("Calcário Calcítico");
    expect(RECOMMENDED_LIMESTONE_TYPE_FIELDS[1].legend).toContain("igual ou maior que 5%");
  });

  it("builds create and update payloads without intermediate fields", () => {
    expect(buildRecommendedLimestoneTypeCreatePayload(form)).toEqual({
      relacao_ca_mg_baixa: 3.25,
      relacao_ca_mg_alta: 4.5,
      observacoes: "Observação preservada",
      fontes: "Fonte preservada",
    });
    expect(buildRecommendedLimestoneTypeUpdatePayload(form)).toEqual({
      novo_relacao_ca_mg_baixa: 3.25,
      novo_relacao_ca_mg_alta: 4.5,
      novo_observacoes: "Observação preservada",
      novo_fontes: "Fonte preservada",
    });
  });

  it("keeps an absent numeric value absent instead of manufacturing zero", () => {
    expect(buildRecommendedLimestoneTypeCreatePayload({ ...form, relacao_ca_mg_baixa: "" }))
      .toMatchObject({ relacao_ca_mg_baixa: null });
  });
});
