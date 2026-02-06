import React from "react";
import { Box, Grid, Text, Input, Heading } from "@chakra-ui/react";
import { FertilizationTableFormState, CropType, CropScientificNames, CropLabels, RegionType, RegionLabels } from "../types";
import { SelectElement, selectFieldStyles, commonFieldStyles, readOnlyFieldStyles } from "../styles";

// Helper para estilo readonly específico se necessário, ou reimportar do styles
const readOnlyStyles = { ...commonFieldStyles, bg: "gray.100", _dark: { bg: "gray.700", borderColor: "gray.600", color: "gray.300" }, cursor: "not-allowed" };

type Props = {
    form: FertilizationTableFormState;
    onFormChange: (field: keyof FertilizationTableFormState, value: any) => void;
    readOnly?: boolean;
};

export default function IdentificationSection({ form, onFormChange, readOnly }: Props) {
    const handleCropChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCrop = e.target.value as CropType;
        onFormChange("nomeComum", selectedCrop);
        
        if (selectedCrop && CropScientificNames[selectedCrop]) {
            onFormChange("nomeCientifico", CropScientificNames[selectedCrop]);
        } else {
            onFormChange("nomeCientifico", "");
        }
    };

    return (
        <>
            <Heading size="sm" color="gray.600" _dark={{ color: "gray.300" }} borderBottomWidth="1px" pb={1}>Identificação</Heading>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                <Box>
                    <Text fontWeight="semibold" mb={1} fontSize="sm" _dark={{ color: "gray.300" }}>Nome comum:</Text>
                    <SelectElement 
                        {...selectFieldStyles} 
                        value={form.nomeComum} 
                        onChange={handleCropChange}
                        placeholder="Selecione uma cultura"
                        disabled={readOnly}
                    >
                        {Object.values(CropType).map(key => (
                            <option key={key} value={key}>{CropLabels[key]}</option>
                        ))}
                    </SelectElement>
                </Box>
                <Box>
                    <Text fontWeight="semibold" mb={1} fontSize="sm" _dark={{ color: "gray.300" }}>Nome científico:</Text>
                    <Input {...readOnlyStyles} value={form.nomeCientifico} readOnly tabIndex={-1} />
                </Box>
                
                <Box>
                    <Text fontWeight="semibold" mb={1} fontSize="sm" _dark={{ color: "gray.300" }}>Região:</Text>
                    <SelectElement 
                        {...selectFieldStyles} 
                        value={form.regiao} 
                        onChange={(e: any) => onFormChange("regiao", e.target.value)}
                        placeholder="Selecione a região"
                        disabled={readOnly}
                    >
                        {Object.values(RegionType).map(key => (
                            <option key={key} value={key}>{RegionLabels[key]}</option>
                        ))}
                    </SelectElement>
                </Box>

                <Box>
                    <Text fontWeight="semibold" mb={1} fontSize="sm" _dark={{ color: "gray.300" }}>Cultivares:</Text>
                    <Input {...commonFieldStyles} value={form.cultivares} onChange={(e) => onFormChange("cultivares", e.target.value)} readOnly={readOnly} />
                </Box>
            </Grid>
        </>
    );
}