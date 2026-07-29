import { describe, expect, it } from "vitest";

import type { RecommendationPrintResponse } from "@/interfaces/Recommendation";
import {
  buildReportIdentificationHtml,
  buildReportPrintHeaderHtml,
  buildReportSignatureHtml,
  getRecommendationTypeLabel,
  writePrintableReport,
} from "./RecommendationPrintDocument";

const completeRecommendation = {
  id: 1,
  tipo_recomendacao: "BOTH",
  cliente_produtor_relatorio: "Produtora Ana",
  propriedade_relatorio: "Fazenda Modelo",
  municipio_relatorio: "Campina Grande",
  uf_relatorio: "PB",
  talhao_relatorio: "12",
  area_avaliada_ha_relatorio: 25.5,
  cultura: "SOJA",
  ano_safra: 2026,
  data_plantio: { day: 5, month: 11, year: 2026 },
  responsavel_tecnico_relatorio: "Eng. João",
  registro_profissional_relatorio: "CREA/PB nº 12345",
  telefone_responsavel_relatorio: "+55 83 99999-0000",
  email_responsavel_relatorio: "joao@example.com",
  data_emissao_relatorio: "2026-07-29",
  autor_assinatura_relatorio: "Eng. João",
} as RecommendationPrintResponse;

describe("documento compartilhado de impressão", () => {
  it("mapeia os três tipos oficiais sem inferência por conteúdo", () => {
    expect(getRecommendationTypeLabel("FERTILIZATION")).toBe("ADUBAÇÃO");
    expect(getRecommendationTypeLabel("ACIDITY_OR_SALINITY_CORRECTION")).toBe("CORREÇÃO DO SOLO");
    expect(getRecommendationTypeLabel("BOTH")).toBe("ADUBAÇÃO E CORREÇÃO DO SOLO");
    expect(getRecommendationTypeLabel("OUTRO")).toBe("");
  });

  it.each([
    ["general", "RELATÓRIO GERAL DA RECOMENDAÇÃO DE ADUBAÇÃO E CORREÇÃO DO SOLO"],
    ["summary", "RELATÓRIO RESUMIDO DA RECOMENDAÇÃO DE ADUBAÇÃO E CORREÇÃO DO SOLO"],
    ["direct", "RELATÓRIO DIRETO DA RECOMENDAÇÃO DE ADUBAÇÃO E CORREÇÃO DO SOLO"],
    ["shopping", "LISTA DE COMPRAS DA RECOMENDAÇÃO DE ADUBAÇÃO E CORREÇÃO DO SOLO"],
  ] as const)("gera o bloco inicial correto de %s", (key, title) => {
    const html = buildReportIdentificationHtml(completeRecommendation, key);
    expect(html).toContain(title);
    expect(html).toContain("Cliente/Produtor");
    expect(html).toContain("Campina Grande – PB");
    expect(html).toContain("25,5 ha");
    expect(html).toContain("05/11/2026");
    expect(html).toContain("29/07/2026");
  });

  it("usa somente dados persistidos do autor no cabeçalho e omite labels vazias", () => {
    const complete = buildReportPrintHeaderHtml(completeRecommendation, "/logo.svg");
    expect(complete).toContain('src="/logo.svg"');
    expect(complete).toContain("Eng. João");
    expect(complete).toContain("Telefone/WhatsApp");
    expect(complete).toContain("joao@example.com");

    const oldRecommendation = { id: 2 } as RecommendationPrintResponse;
    const empty = buildReportPrintHeaderHtml(oldRecommendation, "/logo.svg");
    expect(empty).not.toContain("Telefone/WhatsApp");
    expect(empty).not.toContain("E-mail:");
    expect(buildReportIdentificationHtml(oldRecommendation, "general")).not.toContain("undefined");
    expect(buildReportIdentificationHtml(oldRecommendation, "general")).not.toContain("null");
  });

  it("renderiza assinatura somente quando há autor", () => {
    expect(buildReportSignatureHtml(completeRecommendation)).toContain("Eng. João");
    expect(buildReportSignatureHtml(completeRecommendation)).toContain("report-signature");
    expect(buildReportSignatureHtml({ id: 3 } as RecommendationPrintResponse)).toBe("");
  });

  it("inclui cabeçalho repetível, paginação A4 e assinatura não fixa apenas ao final", () => {
    let html = "";
    const printWindow = {
      document: {
        open: () => undefined,
        write: (value: string) => {
          html = value;
        },
        close: () => undefined,
      },
    } as unknown as Window;

    writePrintableReport(printWindow, "Conteúdo técnico", completeRecommendation, "general", "/logo.svg");

    expect(html).toContain("@page { size: A4 portrait");
    expect(html).toContain(".report-page-frame > thead { display: table-header-group");
    expect(html).not.toContain(".report-print-header { position: fixed");
    expect(html).toContain(".report-signature {");
    expect(html).not.toContain(".report-signature { position: fixed");
    expect(html).toContain("break-inside: avoid");
    expect(html.match(/report-identification/g)?.length).toBeGreaterThan(0);
    expect(html.match(/report-signature/g)?.length).toBeGreaterThan(0);
  });
});
