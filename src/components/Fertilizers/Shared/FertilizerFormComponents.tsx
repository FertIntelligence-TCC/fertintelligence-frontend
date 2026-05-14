// src/components/Fertilizers/Shared/FertilizerFormComponents.tsx
import { Box, Input, Text, BoxProps, Button, HStack } from "@chakra-ui/react";

interface FertilizerInputFieldProps {
    label: string;
    value: string | number;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    type?: string;
    colorScheme?: string;
    isCalc?: boolean;
}

export const FertilizerInputField = ({ 
    label, 
    value, 
    onChange, 
    readOnly, 
    type = "number", 
    colorScheme = "green",
    isCalc = false 
}: FertilizerInputFieldProps) => {
    
    // Estilos dinâmicos baseados na cor
    const styles = {
        field: {
            bg: "white",
            borderColor: "gray.300",
            borderWidth: "1px",
            borderRadius: "md",
            _focus: { borderColor: `${colorScheme}.500`, boxShadow: `0 0 0 1px var(--chakra-colors-${colorScheme}-500)` },
            _dark: { bg: "gray.800", borderColor: "gray.600", color: "white" },
            _disabled: { opacity: 1, bg: "gray.100", cursor: "not-allowed", _dark: { bg: "gray.700" } }
        },
        calcField: {
            bg: "gray.50",
            borderColor: "gray.200",
            color: "gray.600",
            _dark: { bg: "gray.700", borderColor: "gray.600", color: "gray.300" }
        }
    };

    return (
        <Box>
            <Text fontSize="xs" fontWeight="semibold" mb={1} color="gray.600" _dark={{ color: "gray.400" }}>
                {label}
            </Text>
            <Input
                type={type}
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                readOnly={readOnly || isCalc}
                disabled={readOnly || isCalc}
                {...(isCalc ? styles.calcField : styles.field)}
            />
        </Box>
    );
};

interface FormSectionHeaderProps {
    title: string;
    colorScheme?: string;
}

export const FormSectionHeader = ({ title, colorScheme = "green" }: FormSectionHeaderProps) => (
    <Text 
        fontWeight="bold" 
        mb={2} 
        color={`${colorScheme}.600`} 
        _dark={{ color: `${colorScheme}.300` }} 
        borderBottomWidth="1px" 
        pb={1}
    >
        {title}
    </Text>
);

interface ReadOnlyDisplayProps extends BoxProps {
    value: string | number;
}

export const ReadOnlyDisplay = ({ value, ...props }: ReadOnlyDisplayProps) => (
    <Box 
        bg="gray.50"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="md"
        px={3}
        py={2}
        fontWeight="bold"
        color="gray.700"
        display="flex"
        alignItems="center"
        height="40px" // Alinha altura com inputs
        _dark={{ bg: "gray.700", borderColor: "gray.600", color: "gray.200" }}
        {...props}
    >
        {value}
    </Box>
);

interface PublicVisibilitySelectorProps {
    value: "sim" | "nao";
    onChange?: (value: "sim" | "nao") => void;
    readOnly?: boolean;
    colorScheme?: string;
}

export const PublicVisibilitySelector = ({
    value,
    onChange,
    readOnly,
    colorScheme = "green",
}: PublicVisibilitySelectorProps) => (
    <Box>
        <Text fontSize="sm" fontWeight="semibold" mb={2} color="gray.700" _dark={{ color: "gray.300" }}>
            Tornar esse adubo público?
        </Text>
        <HStack gap={3}>
            <Button
                type="button"
                variant={value === "sim" ? "solid" : "outline"}
                colorPalette={colorScheme}
                onClick={() => onChange?.("sim")}
                disabled={readOnly}
            >
                Sim
            </Button>
            <Button
                type="button"
                variant={value === "nao" ? "solid" : "outline"}
                colorPalette={value === "nao" ? "gray" : colorScheme}
                onClick={() => onChange?.("nao")}
                disabled={readOnly}
            >
                Não
            </Button>
        </HStack>
    </Box>
);