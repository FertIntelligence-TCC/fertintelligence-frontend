import { ChangeEvent, ReactNode } from "react";
import { Box, HStack, Input, Text, VStack, chakra, Heading } from "@chakra-ui/react";
import { LatitudeDirection, LongitudeDirection } from "@/interfaces/Property";
import { PropertyFormState } from "./types";

const Field = ({ label, isRequired, children }: FieldProps) => (
    <Box>
        <Text fontWeight="semibold" mb={1}>
            {label}
            {isRequired && (
                <Text as="span" color="red.500" ml={1}>
                    *
                </Text>
            )}
        </Text>
        {children}
    </Box>
);

type FieldProps = {
    label: string;
    isRequired?: boolean;
    children: ReactNode;
};

const SelectElement = chakra("select");

const commonFieldStyles = {
    bg: "white",
    borderColor: "gray.300",
    borderWidth: "1px",
    borderRadius: "md",
    _hover: { borderColor: "gray.400" },
    _focus: {
        borderColor: "green.500",
        boxShadow: "0 0 0 1px var(--chakra-colors-green-500)",
    },
    _dark: {
        bg: "gray.900",
        borderColor: "gray.600",
        _hover: { borderColor: "gray.500" },
        _focus: {
            borderColor: "green.300",
            boxShadow: "0 0 0 1px var(--chakra-colors-green-300)",
        },
    },
} as const;

const selectFieldStyles = {
    ...commonFieldStyles,
    px: 3,
    py: 2,
    cursor: "pointer",
} as const;

type PropertyFormFieldsProps = {
    form: PropertyFormState;
    onFormChange: <Field extends keyof PropertyFormState>(
        field: Field,
        value: PropertyFormState[Field],
    ) => void;
};

const PropertyFormFields = ({ form, onFormChange }: PropertyFormFieldsProps) => (
    <VStack gap={4} align="stretch">
        <Field label="Nome da Propriedade:" isRequired>
            <Input
                variant="outline"
                {...commonFieldStyles}
                value={form.nome}
                onChange={(event) => onFormChange("nome", event.target.value)}
            />
        </Field>
        <Field label="Endereço:" isRequired>
            <Input
                variant="outline"
                {...commonFieldStyles}
                placeholder="ex: Rodovia PB 031, KM 25, Município Sapé, CEP: XXXXX-XXX"
                value={form.endereco}
                onChange={(event) => onFormChange("endereco", event.target.value)}
            />
        </Field>
        <Field label="CNPJ:" isRequired>
            <Input
                variant="outline"
                {...commonFieldStyles}
                placeholder="XX.XXX.XXX/0001-XX"
                value={form.cnpj}
                onChange={(event) => onFormChange("cnpj", event.target.value)}
            />
        </Field>
        <Heading as="h3" size="sm">
            Localização geográfica da sede:
        </Heading>
        <HStack align="start" gap={4}>
            <Field label="Latitude:" isRequired>
                <Input
                    type="number"
                    min={0}
                    max={90}
                    variant="outline"
                    {...commonFieldStyles}
                    value={form.latitude}
                    onChange={(event) => onFormChange("latitude", event.target.value)}
                />
            </Field>
            <Field label="Direção:" isRequired>
                <SelectElement
                    value={form.latitudeDirection}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                        onFormChange(
                            "latitudeDirection",
                            event.target.value as LatitudeDirection,
                        )
                    }
                    {...selectFieldStyles}
                >
                    <option value={LatitudeDirection.NORTE}>Norte</option>
                    <option value={LatitudeDirection.SUL}>Sul</option>
                </SelectElement>
            </Field>
        </HStack>
        <HStack align="start" gap={4}>
            <Field label="Longitude:" isRequired>
                <Input
                    type="number"
                    min={0}
                    max={180}
                    variant="outline"
                    {...commonFieldStyles}
                    value={form.longitude}
                    onChange={(event) => onFormChange("longitude", event.target.value)}
                />
            </Field>
            <Field label="Direção:" isRequired>
                <SelectElement
                    value={form.longitudeDirection}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                        onFormChange(
                            "longitudeDirection",
                            event.target.value as LongitudeDirection,
                        )
                    }
                    {...selectFieldStyles}
                >
                    <option value={LongitudeDirection.LESTE}>Leste</option>
                    <option value={LongitudeDirection.OESTE}>Oeste</option>
                </SelectElement>
            </Field>
        </HStack>
        <Field label="Altitude, em metros:">
            <Input
                type="number"
                variant="outline"
                {...commonFieldStyles}
                value={form.altitude}
                onChange={(event) => onFormChange("altitude", event.target.value)}
            />
        </Field>
    </VStack>
);

export default PropertyFormFields;