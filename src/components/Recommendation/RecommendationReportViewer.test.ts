import { describe, expect, it } from "vitest";
import { foliarAlternativeRowVisualState } from "./RecommendationReportViewer";

describe("foliarAlternativeRowVisualState", () => {
  it("maps backend alternative states without treating undetermined as rejected", () => {
    expect(foliarAlternativeRowVisualState(["Cu", "SELECTED — Escolhida"])).toBe("selected");
    expect(foliarAlternativeRowVisualState(["Cu", "NOT_SELECTED — Não escolhida"])).toBe("not-selected");
    expect(foliarAlternativeRowVisualState(["Cu", "UNDETERMINED — Aguardando preços"])).toBe("undetermined");
  });
});
