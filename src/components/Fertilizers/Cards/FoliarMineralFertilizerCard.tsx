import { Text } from "@chakra-ui/react";
import { MineralFertilizerResponseDto, getFertilizerPhotoIds } from "@/interfaces/Fertilizer";
import FertilizerCardBase from "@/components/Fertilizers/Shared/FertilizerCardBase";

type Props = {
    item: MineralFertilizerResponseDto;
    isSelected: boolean;
    onSelect: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function FoliarMineralFertilizerCard(props: Props) {
    const { item } = props;
    const naturezaFisica = item.natureza_fisica ?? "SOLIDO";
    const isLiquid = naturezaFisica === "LIQUIDO";

    return (
        <FertilizerCardBase
            title={item.nome_adubo}
            badgeLabel="Foliar Mineral"
            colorScheme="blue"
            photoIds={getFertilizerPhotoIds(item)}
            {...props}
        >
            <Text fontSize="xs" color="gray.500" mt={1}>
                Natureza Física:
            </Text>
            <Text fontSize="sm" fontWeight="semibold">
                {isLiquid ? "LÍQUIDO" : "SÓLIDO"}
            </Text>

            {isLiquid && (
                <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }} lineClamp={1}>
                    Densidade: {item.densidade_g_ml ?? "-"} g/ml | Vol.: {item.concentracao_volume_g_l ?? "-"} g/L | Massa: {item.concentracao_massa_g_kg ?? "-"} g/kg
                </Text>
            )}

            <Text fontSize="xs" color="gray.500" mt={1}>
                Garantias Principais:
            </Text>
            <Text fontSize="sm" fontWeight="semibold">
                N: {item.n}% | P: {item.p2o5}% | K: {item.k2o}%
            </Text>
            
            <Text fontSize="xs" color="gray.500" mt={1}>
                Secundários & Micros:
            </Text>
            <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }} lineClamp={1}>
               Ca: {item.ca}% | Mg: {item.mg}% | S: {item.s}% | B: {item.b}%...
            </Text>
        </FertilizerCardBase>
    );
}
