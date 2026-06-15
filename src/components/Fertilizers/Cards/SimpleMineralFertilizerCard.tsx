import { Text } from "@chakra-ui/react";
import { SimpleMineralFertilizerResponseDto, getFertilizerPhotoIds } from "@/interfaces/Fertilizer";
import FertilizerCardBase from "@/components/Fertilizers/Shared/FertilizerCardBase";

type Props = {
    item: SimpleMineralFertilizerResponseDto;
    isSelected: boolean;
    onSelect: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function SimpleMineralFertilizerCard(props: Props) {
    const { item } = props;

    return (
        <FertilizerCardBase
            title={item.nome_adubo}
            badgeLabel="Simples"
            colorScheme="green"
            photoIds={getFertilizerPhotoIds(item)}
            {...props}
        >
            <Text fontSize="xs" color="gray.500" mt={1}>
                Garantias:
            </Text>
            <Text fontSize="sm" fontWeight="semibold">
                N: {item.n}% | P: {item.p2o5}% | K: {item.k2o}%
            </Text>
        </FertilizerCardBase>
    );
}
