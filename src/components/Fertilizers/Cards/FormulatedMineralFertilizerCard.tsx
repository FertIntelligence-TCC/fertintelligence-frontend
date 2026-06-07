import { Text } from "@chakra-ui/react";
import { FormulatedMineralFertilizerResponseDto } from "@/interfaces/Fertilizer";
import FertilizerCardBase from "@/components/Fertilizers/Shared/FertilizerCardBase";
import { formatNpkRelation } from "@/utils/npkRelation";

type Props = {
    item: FormulatedMineralFertilizerResponseDto;
    isSelected: boolean;
    onSelect: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function FormulatedMineralFertilizerCard(props: Props) {
    const { item } = props;
    
    const f = item.formula || { n: 0, p: 0, k: 0 };
    const r = formatNpkRelation(item.relacao || { n: 0, p: 0, k: 0 });
    const formulaName = `NPK ${f.n}-${f.p}-${f.k}`;
    const relationString = `${r.n} : ${r.p} : ${r.k}`;

    return (
        <FertilizerCardBase
            title={formulaName}
            badgeLabel="Formulado"
            colorScheme="purple"
            {...props}
        >
            <Text fontSize="xs" color="gray.500" mt={1}>
                Relação NPK:
            </Text>
            <Text fontSize="sm" fontWeight="semibold">
                {relationString}
            </Text>

            <Text fontSize="xs" color="gray.400" mt={1}>
                Nº Ind.: {item.numero_formula_indicada ?? "-"}
            </Text>
        </FertilizerCardBase>
    );
}
