import { Text } from "@chakra-ui/react";
import { BioFertilizerResponseDto } from "@/interfaces/Fertilizer";
import FertilizerCardBase from "@/components/Fertilizers/Shared/FertilizerCardBase";

type Props = {
    item: BioFertilizerResponseDto;
    isSelected: boolean;
    onSelect: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function BioFertilizerCard(props: Props) {
    const { item } = props;
    const hasMicros = item.b > 0 || item.cu > 0 || item.fe > 0 || item.mn > 0 || item.zn > 0;

    return (
        <FertilizerCardBase
            title={item.nome_adubo}
            badgeLabel="Biofertilizante"
            colorScheme="teal"
            {...props}
        >
            <Text fontSize="xs" color="gray.500" mt={1}>
                Nutrientes Principais:
            </Text>
            <Text fontSize="sm" fontWeight="semibold">
                N: {item.n}% | P: {item.p2o5}% | K: {item.k2o}%
            </Text>
            
            {hasMicros && (
                <Text fontSize="xs" color="gray.500" mt={1} lineClamp={1}>
                    Micros presentes
                </Text>
            )}
        </FertilizerCardBase>
    );
}