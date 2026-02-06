import { Text } from "@chakra-ui/react";
import { OrganoMineralFertilizerResponseDto } from "@/interfaces/Fertilizer";
import FertilizerCardBase from "@/components/Fertilizers/Shared/FertilizerCardBase";

type Props = {
    item: OrganoMineralFertilizerResponseDto;
    isSelected: boolean;
    onSelect: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function OrganoMineralFertilizerCard(props: Props) {
    const { item } = props;

    return (
        <FertilizerCardBase
            title={item.nome_adubo}
            badgeLabel="Organomineral"
            colorScheme="orange"
            {...props}
        >
            <Text fontSize="xs" color="gray.500" mt={1}>
                Garantias Principais:
            </Text>
            <Text fontSize="sm" fontWeight="semibold">
                N: {item.n}% | P: {item.p2o5}% | K: {item.k2o}%
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
                Carbono Orgânico: <Text as="span" fontWeight="bold" color="orange.500">{item.c}%</Text>
            </Text>
        </FertilizerCardBase>
    );
}