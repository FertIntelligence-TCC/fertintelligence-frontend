import { describe, expect, it } from "vitest";

import { normalizeFertilizerSourceOption } from "./generationValidation";

describe("fertilizer source option payload", () => {
  it("preserves the technical option independently from the visible label", () => {
    expect(normalizeFertilizerSourceOption("PUBLIC")).toBe("PUBLIC");
    expect(normalizeFertilizerSourceOption("PRIVATE")).toBe("PRIVATE");
    expect(normalizeFertilizerSourceOption("DEFAULT")).toBe("DEFAULT");
    expect(normalizeFertilizerSourceOption("ALL")).toBe("ALL");
  });

  it("keeps the established legacy mapping", () => {
    expect(normalizeFertilizerSourceOption("BOTH")).toBe("ALL");
  });
});
