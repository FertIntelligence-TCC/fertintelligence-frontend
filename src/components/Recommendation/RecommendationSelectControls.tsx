import { chakra } from "@chakra-ui/react";

export type TableSource = "PRIVATE" | "PUBLIC" | "DEFAULT";
export type TableGroupValue = TableSource | "";

export type TableOption = {
  id: number;
  label: string;
  source: TableSource;
  cropName?: string | null;
};

export type AnalysisExtractOption<TExtract = unknown> = {
  id: number;
  label: string;
  extract: TExtract;
};

export type AnalysisOption<TAnalysis = unknown> = {
  id: number;
  label: string;
  analysis: TAnalysis;
};

export const NativeSelect = chakra("select", {
  base: {
    borderWidth: "1px",
    borderRadius: "md",
    px: 3,
    h: 10,
    width: "100%",
    bg: "bg.panel",
  },
});
