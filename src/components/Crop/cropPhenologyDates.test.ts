import { calculateHarvestDate, clearInvalidLaterDates, validatePhenologyDates } from "./cropPhenologyDates";
import { describe, expect, it } from "vitest";

describe("cropPhenologyDates", () => {
  it("adds the real cycle in UTC without an off-by-one or timezone shift", () => {
    expect(calculateHarvestDate("2026-08-01", 140)).toBe("2026-12-19");
    expect(calculateHarvestDate("2024-02-28", 1)).toBe("2024-02-29");
    expect(calculateHarvestDate("2026-12-20", 20)).toBe("2027-01-09");
  });

  it("does not calculate with a null, zero, negative or partial cycle/date", () => {
    expect(calculateHarvestDate("2026-08-01", "")).toBe("");
    expect(calculateHarvestDate("2026-08-01", 0)).toBe("");
    expect(calculateHarvestDate("2026-08-01", -1)).toBe("");
    expect(calculateHarvestDate("2026-08", 140)).toBe("");
  });

  it("clears only later dates made incompatible", () => {
    expect(clearInvalidLaterDates({
      planting: "2026-08-10", emergence: "2026-08-09", buttoning: "2026-08-20",
      flowering: "2026-09-10", harvest: "2026-12-20",
    })).toEqual({
      planting: "2026-08-10", emergence: "", buttoning: "2026-08-20",
      flowering: "2026-09-10", harvest: "2026-12-20",
    });
  });

  it("accepts equality and rejects each reverse transition", () => {
    expect(validatePhenologyDates({ planting: "2026-08-01", emergence: "2026-08-01", buttoning: "2026-08-01", flowering: "2026-08-01", harvest: "2026-08-01" })).toBeNull();
    expect(validatePhenologyDates({ planting: "2026-08-02", emergence: "2026-08-01", buttoning: "", flowering: "", harvest: "" })).toContain("emergência");
    expect(validatePhenologyDates({ planting: "2026-08-01", emergence: "2026-08-02", buttoning: "2026-08-01", flowering: "", harvest: "" })).toContain("abotoamento");
    expect(validatePhenologyDates({ planting: "2026-08-01", emergence: "2026-08-02", buttoning: "", flowering: "2026-08-01", harvest: "" })).toContain("florescimento");
    expect(validatePhenologyDates({ planting: "2026-08-01", emergence: "2026-08-02", buttoning: "", flowering: "2026-09-01", harvest: "2026-08-31" })).toContain("colheita");
  });
});
