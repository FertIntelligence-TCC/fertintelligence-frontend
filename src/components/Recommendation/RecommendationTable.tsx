import { Box, Table, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

export type RecommendationTableColumn = {
  key: string;
  header: ReactNode;
  minW?: string;
};

type RecommendationTableProps<TRow> = {
  columns: RecommendationTableColumn[];
  rows: TRow[];
  getRowKey?: (row: TRow, index: number) => string;
  renderCell: (row: TRow, column: RecommendationTableColumn, rowIndex: number, columnIndex: number) => ReactNode;
  minW?: string;
};

export const RECOMMENDATION_EMPTY_VALUE = "-";

export const formatRecommendationTableValue = (value: ReactNode): ReactNode => {
  if (value === null || value === undefined || value === "") return RECOMMENDATION_EMPTY_VALUE;
  return value;
};

export default function RecommendationTable<TRow>({
  columns,
  rows,
  getRowKey,
  renderCell,
  minW = "760px",
}: RecommendationTableProps<TRow>) {
  if (rows.length === 0) return null;

  return (
    <Box
      overflowX="auto"
      overflowY="hidden"
      maxW="100%"
      borderWidth="1px"
      borderColor="gray.300"
      borderRadius="md"
      bg="bg.panel"
      _dark={{ borderColor: "gray.600" }}
      css={{
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "thin",
      }}
    >
      <Table.Root
        size="sm"
        minW={minW}
        css={{
          borderCollapse: "collapse",
          "& th, & td": {
            borderWidth: "1px",
            borderColor: "var(--chakra-colors-gray-300)",
            verticalAlign: "top",
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
          },
          "& th": {
            background: "var(--chakra-colors-gray-100)",
            fontWeight: "600",
            color: "var(--chakra-colors-gray-900)",
          },
          "& td": {
            color: "var(--chakra-colors-gray-900)",
          },
          _dark: {
            "& th, & td": {
              borderColor: "var(--chakra-colors-gray-600)",
            },
            "& th": {
              background: "var(--chakra-colors-gray-800)",
              color: "var(--chakra-colors-gray-100)",
            },
            "& td": {
              color: "var(--chakra-colors-gray-100)",
            },
          },
        }}
      >
        <Table.Header>
          <Table.Row>
            {columns.map((column) => (
              <Table.ColumnHeader key={column.key} minW={column.minW}>
                <Text whiteSpace="pre-wrap" overflowWrap="anywhere">
                  {column.header}
                </Text>
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row, rowIndex) => (
            <Table.Row key={getRowKey ? getRowKey(row, rowIndex) : String(rowIndex)}>
              {columns.map((column, columnIndex) => (
                <Table.Cell key={column.key}>
                  {formatRecommendationTableValue(renderCell(row, column, rowIndex, columnIndex))}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
