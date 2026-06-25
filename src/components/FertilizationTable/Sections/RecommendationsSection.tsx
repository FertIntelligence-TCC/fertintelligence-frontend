import { Heading } from "@chakra-ui/react";
import { FertilizationTableFormState } from "../types";

type Props = {
    form: FertilizationTableFormState;
    onFormChange: (field: keyof FertilizationTableFormState, value: any) => void;
    readOnly?: boolean;
};

export default function RecommendationsSection({}: Props) {
    return (
        <>
            <Heading size="sm" color="gray.600" _dark={{ color: "gray.300" }} borderBottomWidth="1px" pb={1} mt={2}>Recomendações Gerais</Heading>
        </>
    );
}
