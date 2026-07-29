import { describe, expect, it } from "vitest";

import {
  buildRecommendationDocumentViews,
  canShowRecommendationPrintButton,
  removeDirectFertilizationObservations,
} from "./RecommendationFolderDocuments";

describe("impressão dos quatro documentos", () => {
  it("permite qualquer documento gerado quando o cargo e o backend autorizam", () => {
    for (const key of ["general", "summary", "direct", "shopping"]) {
      expect(canShowRecommendationPrintButton(true, true, "generated"), key).toBe(true);
    }
  });

  it("mantém bloqueio por cargo, backend e estado do documento", () => {
    expect(canShowRecommendationPrintButton(false, true, "generated")).toBe(false);
    expect(canShowRecommendationPrintButton(true, false, "generated")).toBe(false);
    expect(canShowRecommendationPrintButton(true, true, "not_generated")).toBe(false);
  });
});

describe("observações da recomendação direta", () => {
  it("remove a ocorrência textual anterior para manter apenas a seção estruturada final", () => {
    const report = "Tabela de N, P2O5 e K2O\n\nconteúdo\n\nObservações sobre adubação\n\nAplicar no plantio.";

    expect(removeDirectFertilizationObservations(report)).toBe("Tabela de N, P2O5 e K2O\n\nconteúdo");
  });

  it("não altera documentos sem a seção", () => {
    expect(removeDirectFertilizationObservations("Tabela técnica")).toBe("Tabela técnica");
  });
});

describe("composição teórica do calcário", () => {
  it("preserva a faixa CaO/MgO calculada pelo backend nos documentos aplicáveis", () => {
    const composition = [
      "A relação Ca/Mg do solo é igual a 2.00.",
      "Para manter a relação Ca/Mg esperada entre 3:1 e 4:1, deve ser usado calcário com 46.88% a 51.20% de CaO e 4.09% a 7.78% de MgO.",
      "Composição teórica para 3:1: classificação: Calcário dolomítico.",
      "Composição teórica para 4:1: classificação: Calcário calcítico.",
    ].join("\n");

    const documents = buildRecommendationDocumentViews({
      reportText: composition,
      loadedDocuments: { summary: composition, direct: composition },
      notGeneratedDocuments: {},
      documentErrors: {},
      loadingDocumentKey: null,
    });

    for (const key of ["general", "summary", "direct"] as const) {
      const content = documents.find((document) => document.key === key)?.content;
      expect(content).toContain("relação Ca/Mg esperada entre 3:1 e 4:1");
      expect(content).toContain("Calcário dolomítico");
      expect(content).toContain("Calcário calcítico");
      expect(content).not.toContain("NaN");
      expect(content).not.toContain("Infinity");
    }
  });
});
