import { Text } from "@chakra-ui/react";
import { formatOrganicCarbon, getFertilizerPhotoIds, getOrganicMatterContent, OrganicFertilizerResponseDto } from "@/interfaces/Fertilizer";
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
    const organicMatter = getOrganicMatterContent(item);

    return (
        <FertilizerCardBase
            title={item.nome_adubo}
            badgeLabel="Adubo Orgânico"
            colorScheme="green"
            photoIds={getFertilizerPhotoIds(item)}
            commercialPrice={item}
            {...props}
        >
            <Text fontSize="xs" color="gray.500" mt={1}>
                Composição Física:
            </Text>
            <Text fontSize="sm" fontWeight="semibold">
                Umidade: {item.teor_umidade}% | Matéria orgânica: {organicMatter}%
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
                Carbono orgânico: <Text as="span" fontWeight="bold" color="green.600">{formatOrganicCarbon(organicMatter)}%</Text>
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
                Mineralização: 1° ano {item.taxa_mineralizacao_ano_1 ?? 0}% | 2° ano {item.taxa_mineralizacao_ano_2 ?? 0}% | 3° ano {item.taxa_mineralizacao_ano_3 ?? 0}%
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
                N: <Text as="span" fontWeight="bold" color="green.600">{item.n}%</Text> | P₂O₅: {item.p2o5}% | K₂O: {item.k2o}%
            </Text>
        </FertilizerCardBase>
    );
}
