// src/components/Fertilizers/Shared/FertilizerFormComponents.tsx
import { Box, Input, Text, BoxProps, Button, HStack, SimpleGrid } from "@chakra-ui/react";
import EntityImageUploader from "@/components/EntityImageUploader";
import {
    FertilizerCommercialPriceFormFields,
    FertilizerCommercialPriceResponseFields,
    formatFertilizerCommercialPriceDateForForm,
    getFertilizerCommercialPriceValue,
} from "@/interfaces/Fertilizer";

interface FertilizerInputFieldProps {
    label: string;
    value: string | number;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    type?: string;
    placeholder?: string;
    inputMode?: "text" | "numeric" | "decimal" | "tel" | "search" | "email" | "url";
    colorScheme?: string;
    isCalc?: boolean;
}

export const FertilizerInputField = ({ 
    label, 
    value, 
    onChange, 
    readOnly, 
    type = "number", 
    placeholder,
    inputMode,
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
                placeholder={placeholder}
                inputMode={inputMode}
                onChange={(e) => onChange && onChange(e.target.value)}
                readOnly={readOnly || isCalc}
                disabled={readOnly || isCalc}
                {...(isCalc ? styles.calcField : styles.field)}
            />
        </Box>
    );
};

type CommercialPriceFieldName = keyof FertilizerCommercialPriceFormFields;

interface FertilizerCommercialPriceFieldsProps<TForm extends FertilizerCommercialPriceFormFields> {
    form: TForm;
    onChange: (field: CommercialPriceFieldName, value: string) => void;
    readOnly?: boolean;
    colorScheme?: string;
}

const commercialPriceFields: Array<{ field: CommercialPriceFieldName; label: string }> = [
    { field: "precoSaco5Kg", label: "R$/saco 5 kg" },
    { field: "precoSaco25Kg", label: "R$/saco 25 kg" },
    { field: "precoSaco50Kg", label: "R$/saco 50 kg" },
    { field: "precoSaco1000Kg", label: "R$/saco 1000 kg ou big bag" },
];

const onlyDateMaskCharacters = (value: string) =>
    value
        .replace(/\D/g, "")
        .slice(0, 8)
        .replace(/^(\d{2})(\d)/, "$1/$2")
        .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");

export const FertilizerCommercialPriceFields = <TForm extends FertilizerCommercialPriceFormFields>({
    form,
    onChange,
    readOnly,
    colorScheme = "green",
}: FertilizerCommercialPriceFieldsProps<TForm>) => (
    <Box>
        <FormSectionHeader title="Preços comerciais" colorScheme={colorScheme} />
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
            <FertilizerInputField
                label="Data de tomada de preço"
                type="text"
                placeholder="dd/mm/aaaa"
                inputMode="numeric"
                value={form.dataTomadaPreco}
                onChange={(value) => onChange("dataTomadaPreco", onlyDateMaskCharacters(value))}
                readOnly={readOnly}
                colorScheme={colorScheme}
            />
            {commercialPriceFields.map(({ field, label }) => (
                <FertilizerInputField
                    key={field}
                    label={label}
                    type="text"
                    inputMode="decimal"
                    value={form[field]}
                    onChange={(value) => onChange(field, value)}
                    readOnly={readOnly}
                    colorScheme={colorScheme}
                />
            ))}
        </SimpleGrid>
    </Box>
);

const formatCommercialPriceValue = (value?: number | null) =>
    value == null
        ? ""
        : value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const hasFertilizerCommercialPrice = (item?: FertilizerCommercialPriceResponseFields) =>
    Boolean(
        item?.data_tomada_preco ||
        getFertilizerCommercialPriceValue(item, "5") != null ||
        getFertilizerCommercialPriceValue(item, "25") != null ||
        getFertilizerCommercialPriceValue(item, "50") != null ||
        getFertilizerCommercialPriceValue(item, "1000") != null
    );

export const FertilizerCommercialPriceSummary = ({
    item,
}: {
    item?: FertilizerCommercialPriceResponseFields;
}) => {
    if (!hasFertilizerCommercialPrice(item)) return null;

    const precoSaco5Kg = getFertilizerCommercialPriceValue(item, "5");
    const precoSaco25Kg = getFertilizerCommercialPriceValue(item, "25");
    const precoSaco50Kg = getFertilizerCommercialPriceValue(item, "50");
    const precoSaco1000Kg = getFertilizerCommercialPriceValue(item, "1000");

    const priceParts = [
        precoSaco5Kg != null ? `5 kg: ${formatCommercialPriceValue(precoSaco5Kg)}` : "",
        precoSaco25Kg != null ? `25 kg: ${formatCommercialPriceValue(precoSaco25Kg)}` : "",
        precoSaco50Kg != null ? `50 kg: ${formatCommercialPriceValue(precoSaco50Kg)}` : "",
        precoSaco1000Kg != null ? `1000 kg/big bag: ${formatCommercialPriceValue(precoSaco1000Kg)}` : "",
    ].filter(Boolean);

    return (
        <Box mt={2}>
            <Text fontSize="xs" color="gray.500">
                Preços comerciais:
            </Text>
            {item?.data_tomada_preco && (
                <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
                    Tomada: {formatFertilizerCommercialPriceDateForForm(item.data_tomada_preco)}
                </Text>
            )}
            {priceParts.length > 0 && (
                <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }} lineClamp={2}>
                    {priceParts.join(" | ")}
                </Text>
            )}
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
            {readOnly ? "Visibilidade pública" : "Tornar esse adubo público?"}
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

interface FertilizerPhotosSectionProps {
    photoIds?: string[];
    onChange?: (photoIds: string[]) => void;
    readOnly?: boolean;
    colorScheme?: string;
}

const MAX_FERTILIZER_PHOTOS = 5;

export const FertilizerPhotosSection = ({
    photoIds = [],
    onChange,
    readOnly,
    colorScheme = "green",
}: FertilizerPhotosSectionProps) => {
    const normalizedPhotoIds = photoIds.filter(Boolean).slice(0, MAX_FERTILIZER_PHOTOS);
    const canAddPhoto = normalizedPhotoIds.length < MAX_FERTILIZER_PHOTOS;
    const slots = readOnly
        ? normalizedPhotoIds
        : canAddPhoto
            ? [...normalizedPhotoIds, ""]
            : normalizedPhotoIds;

    const handlePhotoChange = (index: number, imageId: string) => {
        const nextPhotoIds = [...normalizedPhotoIds];

        if (imageId) {
            nextPhotoIds[index] = imageId;
        } else {
            nextPhotoIds.splice(index, 1);
        }

        onChange?.(nextPhotoIds.filter(Boolean).slice(0, MAX_FERTILIZER_PHOTOS));
    };

    return (
        <Box>
            <FormSectionHeader title="Fotos" colorScheme={colorScheme} />
            <Text fontSize="xs" color="gray.500" mb={3} _dark={{ color: "gray.400" }}>
                {normalizedPhotoIds.length}/{MAX_FERTILIZER_PHOTOS} fotos cadastradas
            </Text>
            {slots.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                    {slots.map((photoId, index) => (
                        <EntityImageUploader
                            key={`${photoId || "new"}-${index}`}
                            currentImageId={photoId}
                            onImageIdChange={(imageId) => handlePhotoChange(index, imageId)}
                            label={`Foto ${index + 1}`}
                            readOnly={readOnly}
                        />
                    ))}
                </SimpleGrid>
            ) : (
                <Text color="gray.500" fontSize="sm" _dark={{ color: "gray.400" }}>
                    Nenhuma foto cadastrada.
                </Text>
            )}
            {!readOnly && !canAddPhoto && (
                <Text mt={2} fontSize="sm" color="orange.600" _dark={{ color: "orange.300" }}>
                    Limite de {MAX_FERTILIZER_PHOTOS} fotos atingido.
                </Text>
            )}
        </Box>
    );
};
