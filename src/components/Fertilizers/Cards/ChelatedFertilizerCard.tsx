import { Text } from "@chakra-ui/react";
import { ChelatedFertilizerResponseDto, getFertilizerPhotoIds } from "@/interfaces/Fertilizer";
import FertilizerCardBase from "@/components/Fertilizers/Shared/FertilizerCardBase";

type Props = {
    item: ChelatedFertilizerResponseDto;
    isSelected: boolean;
    onSelect: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function ChelatedFertilizerCard(props: Props) {
    const { item } = props;
    const technicalSummary = `Densidade: ${item.densidade_g_ml ?? "-"} g/ml | Vol.: ${item.concentracao_volume_g_l ?? "-"} g/L | Massa: ${item.concentracao_massa_g_kg ?? "-"} g/kg`;

    const getMicrosSummary = () => {
        const parts = [];
        if (item.fe > 0) parts.push(`Fe: ${item.fe}%`);
        if (item.mn > 0) parts.push(`Mn: ${item.mn}%`);
        if (item.zn > 0) parts.push(`Zn: ${item.zn}%`);
        if (item.cu > 0) parts.push(`Cu: ${item.cu}%`);
        if (item.b > 0) parts.push(`B: ${item.b}%`);
        return parts.length > 0 ? parts.join(" | ") : "Nenhum micro declarado";
    };

    return (
        <FertilizerCardBase
            title={item.nome_adubo}
            badgeLabel="Quelatado"
            colorScheme="purple"
            photoIds={getFertilizerPhotoIds(item)}
            commercialPrice={item}
            {...props}
        >
            <Text fontSize="xs" color="gray.500" mt={1}>
                Especificações Técnicas:
            </Text>
            <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }} lineClamp={1}>
                {technicalSummary}
            </Text>

            <Text fontSize="xs" color="gray.500" mt={1}>
                Micronutrientes Principais:
            </Text>
            <Text fontSize="sm" fontWeight="semibold">
                {getMicrosSummary()}
            </Text>
            
            {(item.n > 0 || item.p2o5 > 0 || item.k2o > 0) && (
                <Text fontSize="xs" color="gray.400" mt={1}>
                   Macros: N: {item.n}% | P: {item.p2o5}% | K: {item.k2o}%
                </Text>
            )}
        </FertilizerCardBase>
    );
}
