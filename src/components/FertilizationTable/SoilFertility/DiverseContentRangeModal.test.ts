import { describe, expect, it } from "vitest";
import {
  NUTRIENTS,
  buildDiverseContentRangePayload,
  getRangeValue,
  rangeFieldsFor,
  visibleRangeFields,
} from "./DiverseContentRangeModal";

describe("Potássio em Teores de Nutrientes Diversos", () => {
  it("exibe uma única opção com a unidade solicitada e os oito campos de magnésio", () => {
    const potassium = NUTRIENTS.filter(({ value }) => value === "potassio");

    expect(potassium).toEqual([{ label: "Potássio (mmolc/dm³)", value: "potassio" }]);
    expect(visibleRangeFields("potassio")).toEqual([
      "menor_teor",
      "teor_inicial_baixo",
      "teor_final_baixo",
      "teor_inicial_medio",
      "teor_final_medio",
      "teor_inicial_alto",
      "teor_final_alto",
      "maior_teor",
    ]);
    expect(rangeFieldsFor("potassio").map(({ label }) => label)).toEqual(
      rangeFieldsFor("magnesio").map(({ label }) => label),
    );
  });

  it("mantém os valores de potássio independentes de magnésio no payload de criação e edição", () => {
    const form = {
      menor_teor_potassio: "0,1",
      teor_inicial_baixo_potassio: "0.2",
      teor_final_baixo_potassio: "1,1",
      teor_inicial_medio_potassio: "1.2",
      teor_final_medio_potassio: "2.2",
      teor_inicial_alto_potassio: "2.3",
      teor_final_alto_potassio: "3.1",
      maior_teor_potassio: "4.1",
      teor_final_baixo_magnesio: "99",
    };

    const create = buildDiverseContentRangePayload(form, false);
    const update = buildDiverseContentRangePayload(form, true);

    expect(create.menor_teor_potassio).toBe(0.1);
    expect(create.teor_inicial_baixo_potassio).toBe(0.2);
    expect(create.teor_final_baixo_potassio).toBe(1.1);
    expect(create.teor_final_baixo_magnesio).toBe(99);
    expect(update.novo_teor_inicial_medio_potassio).toBe(1.2);
    expect(update.novo_teor_final_medio_potassio).toBe(2.2);
    expect(update.novo_teor_inicial_alto_potassio).toBe(2.3);
    expect(update.novo_teor_final_alto_potassio).toBe(3.1);
    expect(update.novo_maior_teor_potassio).toBe(4.1);
  });

  it("não inventa zero para limites de potássio deixados vazios", () => {
    const payload = buildDiverseContentRangePayload({}, false);

    expect(payload).not.toHaveProperty("menor_teor_potassio");
    expect(payload).not.toHaveProperty("teor_inicial_baixo_potassio");
    expect(payload).not.toHaveProperty("teor_final_baixo_potassio");
    expect(payload).not.toHaveProperty("teor_inicial_medio_potassio");
    expect(payload).not.toHaveProperty("teor_final_medio_potassio");
    expect(payload).not.toHaveProperty("teor_inicial_alto_potassio");
    expect(payload).not.toHaveProperty("teor_final_alto_potassio");
    expect(payload).not.toHaveProperty("maior_teor_potassio");
  });

  it("carrega valores próprios do backend e mantém nulos vazios", () => {
    const response = {
      id: 1,
      id_tabela: 2,
      menor_teor_potassio: 0.1,
      teor_inicial_baixo_potassio: null,
      menor_teor_magnesio: 99,
    };

    expect(getRangeValue(response, "menor_teor", "potassio")).toBe(0.1);
    expect(getRangeValue(response, "teor_inicial_baixo", "potassio")).toBe("");
    expect(getRangeValue(response, "menor_teor", "magnesio")).toBe(99);
  });
});
