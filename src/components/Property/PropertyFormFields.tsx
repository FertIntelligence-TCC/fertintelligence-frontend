import { ChangeEvent, ReactNode } from "react";
import {
    Box,
    HStack,
    Input,
    Text,
    VStack,
    chakra,
    Heading,
} from "@chakra-ui/react";
import { LatitudeDirection, LongitudeDirection } from "@/interfaces/Property";
import { PropertyFormState } from "./types";
import EntityImageUploader from "@/components/EntityImageUploader";

/* ======================================================
   Helpers
====================================================== */

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const formatCnpj = (value: string) => {
    const digits = onlyDigits(value).slice(0, 14);

    return digits
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
};

const sanitizeNumber = (value: string, max?: number) => {
    const cleaned = value.replace(/[^\d.]/g, "");
    if (!cleaned) return "";

    const numeric = Number(cleaned);
    if (Number.isNaN(numeric)) return "";

    if (typeof max === "number" && numeric > max) {
        return String(max);
    }

    return cleaned;
};

/* ======================================================
   Field Wrapper
====================================================== */

type FieldProps = {
    label: string;
    isRequired?: boolean;
    children: ReactNode;
};

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

/* ======================================================
   Styles
====================================================== */

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

/* ======================================================
   Props
====================================================== */

type PropertyFormFieldsProps = {
    form: PropertyFormState;
    onFormChange: <Field extends keyof PropertyFormState>(
        field: Field,
        value: PropertyFormState[Field],
    ) => void;
};

/* ======================================================
   Component
====================================================== */

const PropertyFormFields = ({
    form,
    onFormChange,
}: PropertyFormFieldsProps) => {
    return (
        <VStack gap={4} align="stretch">
            <EntityImageUploader
                label="Imagem da Propriedade"
                currentImageId={form.idfoto}
                onImageIdChange={(id) => onFormChange("idfoto", id)}
            />

            {/* Nome */}
            <Field label="Nome da Propriedade:" isRequired>
                <Input
                    variant="outline"
                    {...commonFieldStyles}
                    value={form.nome}
                    onChange={(e) =>
                        onFormChange("nome", e.target.value)
                    }
                />
            </Field>

            {/* Endereço */}
            <Field label="Endereço:" isRequired>
                <Input
                    variant="outline"
                    {...commonFieldStyles}
                    placeholder="ex: Rodovia PB 031, KM 25, Município Sapé, CEP: XXXXX-XXX"
                    value={form.endereco}
                    onChange={(e) =>
                        onFormChange("endereco", e.target.value)
                    }
                />
            </Field>

            {/* CNPJ */}
            <Field label="CNPJ:" isRequired>
                <Input
                    variant="outline"
                    {...commonFieldStyles}
                    placeholder="00.000.000/0000-00"
                    value={formatCnpj(form.cnpj)}
                    onChange={(e) =>
                        onFormChange("cnpj", onlyDigits(e.target.value))
                    }
                />
            </Field>

            <Heading as="h3" size="sm">
                Localização geográfica da sede:
            </Heading>

            {/* Latitude */}
            <HStack align="start" gap={4}>
                <Field label="Latitude:" isRequired>
                    <Input
                        type="number"
                        min={0}
                        max={90}
                        variant="outline"
                        {...commonFieldStyles}
                        value={form.latitude}
                        onChange={(e) =>
                            onFormChange(
                                "latitude",
                                sanitizeNumber(e.target.value, 90),
                            )
                        }
                    />
                </Field>

                <Field label="Direção:" isRequired>
                    <SelectElement
                        value={form.latitudeDirection}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            onFormChange(
                                "latitudeDirection",
                                e.target.value as LatitudeDirection,
                            )
                        }
                        {...selectFieldStyles}
                    >
                        <option value={LatitudeDirection.NORTE}>
                            Norte
                        </option>
                        <option value={LatitudeDirection.SUL}>
                            Sul
                        </option>
                    </SelectElement>
                </Field>
            </HStack>

            {/* Longitude */}
            <HStack align="start" gap={4}>
                <Field label="Longitude:" isRequired>
                    <Input
                        type="number"
                        min={0}
                        max={180}
                        variant="outline"
                        {...commonFieldStyles}
                        value={form.longitude}
                        onChange={(e) =>
                            onFormChange(
                                "longitude",
                                sanitizeNumber(e.target.value, 180),
                            )
                        }
                    />
                </Field>

                <Field label="Direção:" isRequired>
                    <SelectElement
                        value={form.longitudeDirection}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            onFormChange(
                                "longitudeDirection",
                                e.target.value as LongitudeDirection,
                            )
                        }
                        {...selectFieldStyles}
                    >
                        <option value={LongitudeDirection.LESTE}>
                            Leste
                        </option>
                        <option value={LongitudeDirection.OESTE}>
                            Oeste
                        </option>
                    </SelectElement>
                </Field>
            </HStack>

            {/* Altitude */}
            <Field label="Altitude, em metros:">
                <Input
                    type="number"
                    variant="outline"
                    {...commonFieldStyles}
                    value={form.altitude}
                    onChange={(e) =>
                        onFormChange(
                            "altitude",
                            sanitizeNumber(e.target.value),
                        )
                    }
                />
            </Field>
        </VStack>
    );
};

export default PropertyFormFields;