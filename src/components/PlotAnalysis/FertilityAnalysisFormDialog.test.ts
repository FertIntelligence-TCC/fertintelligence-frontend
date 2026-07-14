import { describe, expect, it } from "vitest";

import {
  micronutrientNumberForPayload,
  parseDecimalInputOrNull,
} from "./FertilityAnalysisFormDialog";

describe("fertility micronutrient null and zero contract", () => {
  it("keeps missing and blank values null", () => {
    expect(micronutrientNumberForPayload(undefined)).toBeNull();
    expect(micronutrientNumberForPayload(null)).toBeNull();
    expect(micronutrientNumberForPayload("")).toBeNull();
    expect(micronutrientNumberForPayload("   ")).toBeNull();
  });

  it("preserves explicit numeric zero", () => {
    expect(micronutrientNumberForPayload(0)).toBe(0);
    expect(micronutrientNumberForPayload("0")).toBe(0);
    expect(parseDecimalInputOrNull("0,00")).toBe(0);
  });

  it("parses positive localized values without manufacturing defaults", () => {
    expect(micronutrientNumberForPayload("1,25")).toBe(1.25);
    expect(micronutrientNumberForPayload("inválido")).toBeNull();
  });
});
