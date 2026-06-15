import { Text } from "@chakra-ui/react";
import { BioFertilizerResponseDto } from "@/interfaces/Fertilizer";

type Props = {
    item: BioFertilizerResponseDto;
    mt?: number;
};

const displayValue = (value?: number) => value ?? "-";

export default function BioFertilizerTechnicalDetails({ item, mt = 1 }: Props) {
    return (
        <>
            <Text fontSize="xs" color="gray.500" mt={mt}>
                Especificações Técnicas:
            </Text>
            <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }} lineClamp={2}>
                Densidade: {displayValue(item.densidade_g_ml)} g/ml | Vol.: {displayValue(item.concentracao_volume_g_l)} g/L | Massa: {displayValue(item.concentracao_massa_g_kg)} g/kg | Proteínas: {displayValue(item.proteinas_g_l)} g/L | Aminoácidos: {displayValue(item.aminoacidos_g_l)} g/L | Amidos: {displayValue(item.amidos_g_l)} g/L | Açúcares: {displayValue(item.acucares_g_l)} g/L | Diversos: {displayValue(item.compostos_diversos_g_l)} g/L
            </Text>
        </>
    );
}
