import { describe, expect, it } from "vitest";

import { normalizeRecommendationText } from "./recommendationLocalizedDose";

describe("normalizeRecommendationText", () => {
  it("formats structured FTE and complement values with two decimal places", () => {
    expect(normalizeRecommendationText(0.6998800000000001)).toBe("0,70");
    expect(normalizeRecommendationText(1.4997999999999998)).toBe("1,50");
    expect(normalizeRecommendationText(-2.6668000000000003)).toBe("-2,67");
  });

  it("formats numeric strings only at presentation time", () => {
    expect(normalizeRecommendationText("0.6998800000000001")).toBe("0,70");
  });
});
