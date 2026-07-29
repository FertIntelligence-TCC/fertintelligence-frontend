import { describe, expect, it } from "vitest";

import type { RecommendationResponse } from "@/interfaces/Recommendation";
import {
  getReportHeaderRows,
  getReportIdentification,
  normalizeReportOptionalValue,
} from "./RecommendationReportPresentation";

describe("apresentação compartilhada do relatório", () => {
  it("usa o snapshot nos quatro documentos e omite valores indisponíveis", () => {
    const recommendation = {
      id: 1,
      tipo_recomendacao: "FERTILIZATION",
      responsavel_tecnico_relatorio: "Eng. Ana",
      telefone_responsavel_relatorio: "Não informado.",
      email_responsavel_relatorio: "ana@example.com",
      cliente_produtor_relatorio: "Produtor A",
      propriedade_relatorio: "Fazenda A",
      registro_profissional_relatorio: "N/A",
    } as RecommendationResponse;

    expect(getReportHeaderRows(recommendation)).toEqual([
      { label: "Nome", value: "Eng. Ana" },
      { label: "E-mail", value: "ana@example.com" },
    ]);

    for (const key of ["general", "summary", "direct", "shopping"] as const) {
      const presentation = getReportIdentification(recommendation, key);
      expect(presentation.title).toContain("DE ADUBAÇÃO");
      expect(presentation.rows).toContainEqual({ label: "Cliente/Produtor", value: "Produtor A" });
      expect(presentation.rows.some((row) => row.label === "Registro profissional")).toBe(false);
    }
  });

  it("distingue zero válido de null, vazio e sentinelas legadas", () => {
    expect(normalizeReportOptionalValue(0)).toBe("0");
    expect(normalizeReportOptionalValue(null)).toBe("");
    expect(normalizeReportOptionalValue(" ")).toBe("");
    expect(normalizeReportOptionalValue("Não informada.")).toBe("");
    expect(normalizeReportOptionalValue("-")).toBe("");
  });
});
