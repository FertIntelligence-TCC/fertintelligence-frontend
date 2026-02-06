import { Text } from "@chakra-ui/react";
import { MineralFertilizerResponseDto } from "@/interfaces/Fertilizer";
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

    return (
        <FertilizerCardBase
            title={item.nome_adubo}
            badgeLabel="Foliar Mineral"
            colorScheme="blue"
            {...props}
        >
            <Text fontSize="xs" color="gray.500" mt={1}>
                Garantias Principais:
            </Text>
            <Text fontSize="sm" fontWeight="semibold">
                N: {item.n}% | P: {item.p2o5}% | K: {item.k2o}%
            </Text>
            
            <Text fontSize="xs" color="gray.500" mt={1}>
                Secundários & Micros:
            </Text>
            <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }} noOfLines={1}>
               Ca: {item.ca}% | Mg: {item.mg}% | S: {item.s}% | B: {item.b}%...
            </Text>
        </FertilizerCardBase>
    );
}