import { Text } from "@chakra-ui/react";
import { OrganicFertilizerResponseDto } from "@/interfaces/Fertilizer";
import FertilizerCardBase from "@/components/Fertilizers/Shared/FertilizerCardBase";

type Props = {
    item: OrganicFertilizerResponseDto;
    isSelected: boolean;
    onSelect: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function OrganicFertilizerCard(props: Props) {
    const { item } = props;

    return (
        <FertilizerCardBase
            title={item.nome_adubo}
            badgeLabel="Adubo Orgânico"
            colorScheme="green"
            {...props}
        >
            <Text fontSize="xs" color="gray.500" mt={1}>
                Composição Física:
            </Text>
            <Text fontSize="sm" fontWeight="semibold">
                Umidade: {item.teor_umidade}% | Cinzas: {item.teor_cinzas}%
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
                N: <Text as="span" fontWeight="bold" color="green.600">{item.n}%</Text> | P₂O₅: {item.p2o5}% | K₂O: {item.k2o}%
            </Text>
        </FertilizerCardBase>
    );
}
