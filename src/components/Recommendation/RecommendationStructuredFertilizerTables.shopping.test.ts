import { describe, expect, it } from "vitest";

import {
  buildShoppingInputSections,
  buildStructuredCorrectiveTables,
  getShoppingInputTitle,
} from "./RecommendationStructuredFertilizerTables";

describe("lista de insumos estruturada", () => {
  const document = {
    area_usada_no_talhao: 50,
    blocos: [
      {
        nome: "Adubação Corretiva",
        opcoes: [
          {
            nome: "Opção 1 - formulado corretivo e FTE",
            mutuamente_exclusiva: true,
            itens: [
              { insumo: "NPK 00-20-20", quantidade_por_hectare: "500.00 kg/ha", total_area: "25000.00 kg", fase: "Formulado corretivo" },
              { insumo: "FTE BR-12", quantidade_por_hectare: "16.67 kg/ha", total_area: "833.50 kg", fase: "FTE" },
              { insumo: "Sulfato de Cobre", quantidade_por_hectare: "4.00 kg/ha", total_area: "200.00 kg", fase: "Complemento Cu" },
              { insumo: "Sulfato Manganoso", quantidade_por_hectare: "5.00 kg/ha", total_area: "250.00 kg", fase: "Complemento Mn" },
            ],
          },
          {
            nome: "Opção 2 - fontes simples",
            mutuamente_exclusiva: true,
            itens: [{ insumo: "Superfosfato Simples", quantidade_por_hectare: "333.33 kg/ha", total_area: "16666.50 kg" }],
          },
        ],
      },
      { nome: "Adubação de plantio e cobertura", opcoes: [] },
    ],
  };

  it("usa a área cultivada no novo título", () => {
    expect(getShoppingInputTitle(document)).toBe("Lista de insumos para a área cultivada (50 ha)");
    expect(getShoppingInputTitle(document)).not.toContain("Lista de Compras");
  });

  it("preserva fontes, doses, totais e alternativas em opções independentes", () => {
    const sections = buildShoppingInputSections(document);

    expect(sections.map(({ title }) => title)).toEqual(["Adubação Corretiva", "Adubação de plantio e cobertura"]);
    expect(sections[0].options).toHaveLength(2);
    expect(sections[0].options.every(({ mutuallyExclusive }) => mutuallyExclusive)).toBe(true);
    expect(sections[0].options[0].items.map(({ insumo }) => insumo)).toEqual([
      "NPK 00-20-20", "FTE BR-12", "Sulfato de Cobre", "Sulfato Manganoso",
    ]);
    expect(sections[0].options[0].items[0].quantidade_por_hectare).toBe("500.00 kg/ha");
    expect(sections[0].options[0].items[0].total_area).toBe("25000.00 kg");
    expect(sections[0].options[1].items[0].insumo).toBe("Superfosfato Simples");
  });

  it("trata área ausente e lista vazia sem inventar valores", () => {
    expect(getShoppingInputTitle({ blocos: [] })).toContain("área não informada");
    expect(buildShoppingInputSections({ blocos: [] })).toEqual([]);
  });

  it("mantém todos os itens corretivos estruturados na Resumida e na Direta", () => {
    const tables = buildStructuredCorrectiveTables({
      tabelas_estruturadas: [{
        titulo: "Adubação corretiva - fontes",
        chave_secao: "adubacao_corretiva_opcao_1",
        colunas: ["Finalidade", "Necessidade", "Fonte", "Dose", "Memória", "Observação"],
        linhas: [
          ["Formulado", "P/K", "NPK 00-20-20", "300.00 kg/ha", "memória", "observação"],
          ["FTE", "Zn", "FTE BR-12", "16.67 kg/ha", "memória", "observação"],
          ["Complemento Cu", "Cu", "Sulfato de Cobre", "4.00 kg/ha", "memória", "observação Cu"],
          ["Complemento Mn", "Mn", "Sulfato Manganoso", "5.00 kg/ha", "memória", "observação Mn"],
        ],
      }],
    });

    expect(tables[0].rows.map((row) => row[2])).toEqual([
      "NPK 00-20-20", "FTE BR-12", "Sulfato de Cobre", "Sulfato Manganoso",
    ]);
    expect(tables[0].rows[2]).toContain("4.00 kg/ha");
    expect(tables[0].rows[2]).toContain("observação Cu");
  });
});
