import { Text } from "@chakra-ui/react";
import { GreenFertilizerResponseDto, getFertilizerPhotoIds } from "@/interfaces/Fertilizer";
import FertilizerCardBase from "@/components/Fertilizers/Shared/FertilizerCardBase";

type Props = {
    item: GreenFertilizerResponseDto;
    isSelected: boolean;
    onSelect: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function GreenFertilizerCard(props: Props) {
    const { item } = props;
    const cnRatio = item.n > 0 ? (item.c / item.n).toFixed(1) : "-";

    return (
        <FertilizerCardBase
            title={item.nome_adubo}
            badgeLabel="Adubo Verde"
            colorScheme="green"
            photoIds={getFertilizerPhotoIds(item)}
            commercialPrice={item}
            {...props}
        >
            <Text fontSize="xs" color="gray.500" mt={1}>
                Parâmetros Principais:
            </Text>
            <Text fontSize="sm" fontWeight="semibold">
                N: {item.n}% | C: {item.c}%
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
                Prod. esperada: <Text as="span" fontWeight="bold" color="green.600">{item.produtividade_esperada ?? 0} kg/ha</Text>
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
                Relação C/N: <Text as="span" fontWeight="bold" color="green.600">{cnRatio}</Text>
            </Text>
        </FertilizerCardBase>
    );
}
