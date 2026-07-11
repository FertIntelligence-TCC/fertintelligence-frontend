import { describe, expect, it } from "vitest";
import {
  NUTRIENTS,
  buildDiverseContentRangePayload,
  visibleRangeFields,
} from "./DiverseContentRangeModal";

describe("Potássio em Teores de Nutrientes Diversos", () => {
  it("exibe uma única opção com a unidade solicitada e quatro campos", () => {
    const potassium = NUTRIENTS.filter(({ value }) => value === "potassio");

    expect(potassium).toEqual([{ label: "Potássio (mmolc/dm³)", value: "potassio" }]);
    expect(visibleRangeFields("potassio")).toEqual([
      "teor_final_baixo",
      "teor_inicial_medio",
      "teor_final_medio",
      "teor_inicial_alto",
    ]);
  });

  it("mantém os valores de potássio independentes de magnésio no payload de criação e edição", () => {
    const form = {
      teor_final_baixo_potassio: "1,1",
      teor_inicial_medio_potassio: "1.2",
      teor_final_medio_potassio: "2.2",
      teor_inicial_alto_potassio: "2.3",
      teor_final_baixo_magnesio: "99",
    };

    const create = buildDiverseContentRangePayload(form, false);
    const update = buildDiverseContentRangePayload(form, true);

    expect(create.teor_final_baixo_potassio).toBe(1.1);
    expect(create.teor_final_baixo_magnesio).toBe(99);
    expect(update.novo_teor_inicial_medio_potassio).toBe(1.2);
    expect(update.novo_teor_final_medio_potassio).toBe(2.2);
    expect(update.novo_teor_inicial_alto_potassio).toBe(2.3);
  });

  it("não inventa zero para limites de potássio deixados vazios", () => {
    const payload = buildDiverseContentRangePayload({}, false);

    expect(payload).not.toHaveProperty("teor_final_baixo_potassio");
    expect(payload).not.toHaveProperty("teor_inicial_medio_potassio");
    expect(payload).not.toHaveProperty("teor_final_medio_potassio");
    expect(payload).not.toHaveProperty("teor_inicial_alto_potassio");
  });
});
