import { describe, expect, it } from "vitest";

import { buildStructuredSummaryTables } from "./RecommendationStructuredFertilizerTables";

describe("structured recommendation summary tables", () => {
  it("keeps fertilizer and opportunity-cost tables structured with backend headers", () => {
    const tables = buildStructuredSummaryTables({
      structuredTables: [
        {
          sectionKey: "fertilizantes_recomendados",
          title: "Fertilizantes recomendados",
          columns: ["Tipo", "Fertilizante", "N", "P2O5", "K2O", "S", "Justificativa"],
          rows: [["SIMPLES", "Superfosfato Simples", "0,00%", "18,00%", "0,00%", "12,00%", "Fonte corretiva"]],
        },
        {
          sectionKey: "custo_oportunidade",
          title: "Comparativo de custo de oportunidade",
          columns: ["Nutriente", "R$/kg nutriente", "Fonte", "Tipo", "Unidade comercial", "Preço comercial"],
          rows: [["P2O5", "R$ 2,50", "Superfosfato Triplo", "SIMPLES", "50 kg", "R$ 125,00"]],
        },
      ],
    });

    expect(tables).toHaveLength(2);
    expect(tables[0].columns).toEqual(["Tipo", "Fertilizante", "N", "P2O5", "K2O", "S", "Justificativa"]);
    expect(tables[1].columns).toEqual([
      "Nutriente",
      "R$/kg nutriente",
      "Fonte",
      "Tipo",
      "Unidade comercial",
      "Preço comercial",
    ]);
    expect(tables[1].rows[0][1]).toBe("R$ 2,50");
  });

  it("does not re-render corrective sections as summary tables", () => {
    expect(buildStructuredSummaryTables({
      structuredTables: [{
        sectionKey: "adubacao_corretiva_opcao_1",
        columns: ["Fonte", "Dose"],
        rows: [["00-20-20", "200 kg/ha"]],
      }],
    })).toEqual([]);
  });
});
