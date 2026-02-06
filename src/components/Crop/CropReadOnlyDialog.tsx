import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import DialogContainer from "@/components/Property/DialogContainer";
import { CropDate, CropResponseDto } from "@/interfaces/Crop";

interface CropReadOnlyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  crop: CropResponseDto | null;
}

const formatDate = (date?: CropDate) => {
  if (!date) return "-";
  const day = date.day.toString().padStart(2, "0");
  const month = date.month.toString().padStart(2, "0");
  return `${day}/${month}/${date.year}`;
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <Box>
    <Text
      fontSize="xs"
      color="gray.500"
      fontWeight="bold"
      textTransform="uppercase"
    >
      {label}
    </Text>
    <Text fontSize="md" color="gray.700" _dark={{ color: "gray.200" }}>
      {value}
    </Text>
  </Box>
);

export const CropReadOnlyDialog = ({
  isOpen,
  onClose,
  crop,
}: CropReadOnlyDialogProps) => {
  if (!isOpen || !crop) return null;

  return (
    <DialogContainer isOpen={isOpen} onClose={onClose} zIndex={1600}>
      <Heading as="h3" size="md" mb={4} color="green.600">
        Detalhes da Cultura: {crop.nome.replace(/_/g, " ")}
      </Heading>

      <VStack align="stretch" gap={4}>
        <Grid templateColumns="1fr 1fr" gap={4}>
          <DetailItem label="Tipo de Cultivo" value={crop.tipo_cultivo} />
          <DetailItem label="Variedade" value={crop.variedade} />
        </Grid>

        <Grid templateColumns="1fr 1fr" gap={4}>
          <DetailItem label="Ciclo" value={`${crop.ciclo} dias`} />
          <DetailItem label="Nome" value={crop.nome.replace(/_/g, " ")} />
        </Grid>

        <Separator my={1} />

        <Grid templateColumns="1fr 1fr" gap={4}>
          <DetailItem
            label="Distância entre linhas"
            value={`${crop.distancia_entre_linhas} m`}
          />
          <DetailItem
            label="Plantas por metro"
            value={crop.numero_plantas_por_metro}
          />
        </Grid>

        <Separator my={1} />

        <Grid templateColumns="1fr 1fr" gap={4}>
          <DetailItem
            label="Produtividade esperada"
            value={`${crop.produtividade_esperada} kg/ha`}
          />
          <DetailItem
            label="Produtividade obtida"
            value={`${crop.produtividade_obtida} kg/ha`}
          />
        </Grid>
        <Grid templateColumns="1fr 1fr" gap={4}>
          <DetailItem
            label="Área usada no talhão"
            value={`${crop.area_usada_no_talhao} ha`}
          />
          <DetailItem label="ID" value={crop.id} />
        </Grid>

        <Separator my={1} />

        <Grid templateColumns="1fr 1fr" gap={4}>
          <DetailItem
            label="Data de Plantio"
            value={formatDate(crop.data_plantio)}
          />
          <DetailItem
            label="Data de Emergência"
            value={formatDate(crop.data_emergencia)}
          />
        </Grid>
        <Grid templateColumns="1fr 1fr" gap={4}>
          <DetailItem
            label="Data de Botonamento"
            value={formatDate(crop.data_botonamento)}
          />
          <DetailItem
            label="Data de Florescimento"
            value={formatDate(crop.data_florescimento)}
          />
        </Grid>
        <Grid templateColumns="1fr 1fr" gap={4}>
          <DetailItem
            label="Data de Colheita"
            value={formatDate(crop.data_colheita)}
          />
          <Box />
        </Grid>
      </VStack>

      <Flex justify="flex-end" mt={6}>
        <Button onClick={onClose} colorScheme="red" variant="outline">
          Fechar
        </Button>
      </Flex>
    </DialogContainer>
  );
};