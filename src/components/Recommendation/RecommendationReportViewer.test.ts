import { describe, expect, it } from "vitest";

import { parseRecommendationReportBlocks } from "./RecommendationReportViewer";

describe("RecommendationReportViewer", () => {
  const malformedLegacyTable = "13. Fertilizantes recomendados\n| Tipo | Fertilizante |\n| linha sem separador | SSP |";

  it("does not show the legacy warning when structured tables are available", () => {
    const blocks = parseRecommendationReportBlocks(malformedLegacyTable, true);

    expect(blocks.some((block) => block.type === "warning")).toBe(false);
  });

  it("keeps the warning for genuinely legacy content without structured tables", () => {
    const blocks = parseRecommendationReportBlocks(malformedLegacyTable, false);

    expect(blocks.some((block) => block.type === "warning")).toBe(true);
  });

  it("parses a valid backend table into headers and cells", () => {
    const blocks = parseRecommendationReportBlocks(
      "| Tipo | Fertilizante | N | P2O5 | K2O | S | Justificativa |\n" +
        "|---|---|---:|---:|---:|---:|---|\n" +
        "| SIMPLES | Superfosfato Simples | 0.00% | 18.00% | 0.00% | 12.00% | Fonte corretiva |",
    );

    const table = blocks.find((block) => block.type === "table");
    expect(table).toMatchObject({
      type: "table",
      headers: ["Tipo", "Fertilizante", "N", "P2O5", "K2O", "S", "Justificativa"],
      rows: [["SIMPLES", "Superfosfato Simples", "0.00%", "18.00%", "0.00%", "12.00%", "Fonte corretiva"]],
    });
  });
});
