import { describe, expect, it } from "vitest";

import { buildMicronutrientFertilizerTableModel } from "./MicronutrientFertilizerTable";

describe("micronutrient complement table", () => {
  it("uses the required complementary fertilization title", () => {
    const model = buildMicronutrientFertilizerTableModel({
      adubos_solidos_micronutrientes: [{
        micronutriente: "B",
        nome_adubo: "Bórax",
        dose_kg_ha: 10,
        tipo_fonte: "MINERAL",
      }],
    });

    expect(model?.title).toBe(
      "Adubação complementar de micronutrientes com outras fontes (usar na adubação corretiva ou na de plantio)",
    );
    expect(model?.rows[0][0]).toBe("MINERAL");
  });
});
