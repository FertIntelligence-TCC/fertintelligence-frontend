import { describe, expect, it } from "vitest";
import {
  foliarAlternativeRowVisualState,
  normalizeRecommendationReportText,
  parseRecommendationReportBlocks,
} from "./RecommendationReportViewer";

describe("foliarAlternativeRowVisualState", () => {
  it("maps backend alternative states without treating undetermined as rejected", () => {
    expect(foliarAlternativeRowVisualState(["Cu", "SELECTED — Escolhida"])).toBe("selected");
    expect(foliarAlternativeRowVisualState(["Cu", "NOT_SELECTED — Não escolhida"])).toBe("not-selected");
    expect(foliarAlternativeRowVisualState(["Cu", "UNDETERMINED — Aguardando preços"])).toBe("undetermined");
  });
});

describe("preparação segura de relatórios legados", () => {
  it("remove comentários internos multilinha e o cabeçalho institucional obsoleto", () => {
    const legacy = [
      "<!-- formato: markdown;",
      "fonte: Aptos; tamanho: 10 -->",
      "**FertIntelligence**",
      "- Endereço: Não informado.",
      "- Telefone/WhatsApp: Não informado.",
      "- E-mail: Não informado.",
      "- CEO: Não informado.",
      "",
      "Identificação",
      "- Cliente/Produtor: Produtor legado",
      "- Propriedade: Fazenda legada",
      "",
      "Diagnóstico químico",
      "Conteúdo técnico preservado.",
    ].join("\n");

    const normalized = normalizeRecommendationReportText(legacy);
    expect(normalized).not.toContain("<!--");
    expect(normalized).not.toContain("Endereço");
    expect(normalized).not.toContain("CEO");
    expect(normalized).not.toContain("Não informado");
    expect(normalized).not.toContain("Produtor legado");
    expect(normalized).not.toContain("Fazenda legada");
    expect(normalized).toContain("Diagnóstico químico");
    expect(normalized).toContain("Conteúdo técnico preservado.");
  });

  it("remove metadados estruturados duplicados mesmo quando possuem valores", () => {
    const normalized = normalizeRecommendationReportText([
      "Telefone/WhatsApp: 55 83 991214231",
      "E-mail: profissional@exemplo.com",
      "Recomendação: aplicar 100 kg/ha.",
    ].join("\n"));

    expect(normalized).not.toContain("991214231");
    expect(normalized).not.toContain("profissional@exemplo.com");
    expect(normalized).toContain("Recomendação: aplicar 100 kg/ha.");
  });

  it("não remove uma expressão não informativa dentro de texto agronômico legítimo", () => {
    const report = "O teor não informado na análise impede apenas este cálculo.";
    expect(normalizeRecommendationReportText(report)).toBe(report);
    expect(parseRecommendationReportBlocks(report)).toEqual([
      { type: "text", content: report },
    ]);
  });
});
