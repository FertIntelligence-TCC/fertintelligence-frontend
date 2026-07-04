import { Box, SimpleGrid, Text } from "@chakra-ui/react";

import {
  type TableGroupValue,
  type TableOption,
  NativeSelect,
} from "./RecommendationSelectControls";

type RecommendationTableSelectorProps = {
  label: string;
  group: TableGroupValue;
  tableId: string;
  tables: TableOption[];
  loadingTables: boolean;
  optional?: boolean;
  onGroupChange: (value: TableGroupValue) => void;
  onTableChange: (value: string) => void;
};

const tableGroupOptions: { value: Exclude<TableGroupValue, "">; label: string }[] = [
  { value: "PRIVATE", label: "Privadas" },
  { value: "PUBLIC", label: "Públicas" },
  { value: "DEFAULT", label: "Padrão" },
];

const getTableChoicePlaceholder = (group: TableGroupValue, tables: TableOption[], optional?: boolean) => {
  if (!group) return optional ? "Opcional: selecione um grupo" : "Selecione o grupo da tabela";
  return tables.length ? "Escolha da tabela" : "Nenhuma tabela encontrada";
};

export default function RecommendationTableSelector({
  label,
  group,
  tableId,
  tables,
  loadingTables,
  optional = false,
  onGroupChange,
  onTableChange,
}: RecommendationTableSelectorProps) {
  const safeTables = Array.isArray(tables) ? tables : [];

  return (
    <Box>
      <Text fontSize="sm" mb={1}>{label}</Text>
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={2}>
        <NativeSelect
          value={group}
          onChange={(event) => {
            onGroupChange(event.target.value as TableGroupValue);
            onTableChange("");
          }}
          disabled={loadingTables}
          aria-label={`${label}: grupo da tabela`}
        >
          <option value="">Grupo da tabela</option>
          {tableGroupOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={tableId}
          onChange={(event) => onTableChange(event.target.value)}
          disabled={loadingTables || !group || safeTables.length === 0}
          aria-label={`${label}: escolha da tabela`}
        >
          <option value="">{getTableChoicePlaceholder(group, safeTables, optional)}</option>
          {safeTables.map((table) => (
            <option key={`${table.source}-${table.id}`} value={table.id}>{table.label}</option>
          ))}
        </NativeSelect>
      </SimpleGrid>
    </Box>
  );
}
