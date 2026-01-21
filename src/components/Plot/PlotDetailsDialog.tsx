import { Button, Flex, Heading, Text, VStack, Grid, Box } from "@chakra-ui/react";
import DialogContainer from "@/components/Property/DialogContainer";
import { PlotResponse } from "@/interfaces/Plot";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    plot: PlotResponse | null;
};

const DetailItem = ({ label, value }: { label: string, value: string | number }) => (
    <Box>
        <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">{label}</Text>
        <Text fontSize="md" color="gray.700" _dark={{ color: "gray.200" }}>{value}</Text>
    </Box>
);

export default function PlotDetailsDialog({ isOpen, onClose, plot }: Props) {
    if (!plot) return null;

    return (
        <DialogContainer isOpen={isOpen} onClose={onClose}>
            <Heading as="h2" size="md" mb={6} color="green.600">
                Detalhes do Talhão: {plot.identificacao}
            </Heading>
            
            <VStack align="stretch" gap={4}>
                <Grid templateColumns="1fr 1fr" gap={4}>
                    <DetailItem label="Área" value={`${plot.area} ha`} />
                    <DetailItem label="Ano Safra" value={plot.ano_incorporacao_safra} />
                </Grid>
                
                <Grid templateColumns="1fr 1fr" gap={4}>
                    <DetailItem label="Classe Solo" value={plot.classe_solo} />
                    <DetailItem label="Textura Solo" value={plot.textura_solo} />
                </Grid>

                <Grid templateColumns="1fr 1fr" gap={4}>
                    <DetailItem label="Irrigada" value={plot.area_irrigada} />
                    <DetailItem label="Declividade" value={`${plot.declividade}%`} />
                </Grid>

                <Grid templateColumns="1fr 1fr" gap={4}>
                    <DetailItem label="Pluv. Mensal (mm)" value={`${plot.pluviosidade_mensal} mm`} />
                    <DetailItem label="Pluv. Anual (mm)" value={`${plot.pluviosidade_anual} mm`} />
                </Grid>
            </VStack>

            <Flex justify="flex-end" mt={8}>
                <Button onClick={onClose} colorScheme="blue">Fechar</Button>
            </Flex>
        </DialogContainer>
    );
}