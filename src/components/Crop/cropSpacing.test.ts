import { describe, expect, it } from "vitest";

import { buildCropSpacingFields, getCropSpacingValidationMessage } from "./cropSpacing";

describe("cadastro de cultura com espaçamento por covas", () => {
  it("mantém a distância positiva no campo esperado pelo backend e no cálculo", () => {
    const fields = buildCropSpacingFields("holes", "1", "2", "", null);

    expect(fields).toEqual({
      numero_plantas_por_metro: 2,
      distancia_entre_covas: 1,
      numero_plantas_por_cova: 2,
    });
    expect(getCropSpacingValidationMessage("holes", "3", "1", "2", "")).toBe("");
  });

  it("mantém as mensagens legítimas para distância zero e valor ausente", () => {
    const message = "O modo Distância entre covas (m) exige distância entre covas maior que zero.";

    expect(getCropSpacingValidationMessage("holes", "3", "0", "1", "")).toBe(message);
    expect(getCropSpacingValidationMessage("holes", "3", "", "1", "")).toBe(message);
  });

  it("não altera a validação do modo por plantas por metro", () => {
    expect(getCropSpacingValidationMessage("plants_per_meter", "3", "", "", "1")).toBe("");
    expect(getCropSpacingValidationMessage("plants_per_meter", "3", "", "", "0"))
      .toContain("plantas por metro linear maior que zero");
  });
});
