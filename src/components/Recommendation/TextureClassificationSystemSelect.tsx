import { Box, Text, chakra } from "@chakra-ui/react";

export type TextureClassificationSystem = "BRASILEIRO" | "AMERICANO";

type TextureClassificationSystemSelectProps = {
  value: TextureClassificationSystem;
  onChange: (value: TextureClassificationSystem) => void;
};

const NativeSelect = chakra("select", {
  base: {
    borderWidth: "1px",
    borderRadius: "md",
    px: 3,
    h: 10,
    width: "100%",
    bg: "bg.panel",
  },
});

const textureClassificationOptions: { value: TextureClassificationSystem; label: string }[] = [
  { value: "BRASILEIRO", label: "Brasileiro" },
  { value: "AMERICANO", label: "Americano" },
];

export default function TextureClassificationSystemSelect({
  value,
  onChange,
}: TextureClassificationSystemSelectProps) {
  return (
    <Box>
      <Text fontSize="sm" mb={1}>Qual classificação textural de solos usar?</Text>
      <NativeSelect
        value={value}
        onChange={(event) => onChange(event.target.value as TextureClassificationSystem)}
        aria-label="Qual classificação textural de solos usar?"
      >
        {textureClassificationOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </NativeSelect>
    </Box>
  );
}
