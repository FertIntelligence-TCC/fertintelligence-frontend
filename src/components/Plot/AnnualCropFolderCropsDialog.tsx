import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { FiEye } from "react-icons/fi";
import { toaster } from "@/components/ui/toaster";
import DialogContainer from "@/components/Property/DialogContainer";
import { AnnualCropFolderResponseDto } from "@/interfaces/AnnualCropFolder";
import { CropResponseDto, CropDate } from "@/interfaces/Crop";
import { getCropsByFolder } from "@/services/cropService";

interface AnnualCropFolderCropsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  folder: AnnualCropFolderResponseDto | null;
  onSelectCrop: (crop: CropResponseDto) => void;
}

const formatDate = (date?: CropDate) => {
  if (!date) return "-";
  const day = date.day.toString().padStart(2, "0");
  const month = date.month.toString().padStart(2, "0");
  return `${day}/${month}/${date.year}`;
};

export const AnnualCropFolderCropsDialog = ({
  isOpen,
  onClose,
  folder,
  onSelectCrop,
}: AnnualCropFolderCropsDialogProps) => {
  const [crops, setCrops] = useState<CropResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCropId, setActiveCropId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || !folder) return;

    const fetchCrops = async () => {
      setIsLoading(true);
      try {
        const data = await getCropsByFolder(folder.id);
        setCrops(data);
      } catch (error) {
        console.error(error);
        toaster.create({
          title: "Erro ao carregar",
          description: "Não foi possível carregar as culturas desta pasta.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrops();
  }, [folder, isOpen]);

  if (!isOpen || !folder) return null;

  return (
    <DialogContainer isOpen={isOpen} onClose={onClose} zIndex={1500}>
      <Flex justify="space-between" align="center" mb={6}>
        <VStack align="start" gap={1}>
          <Heading as="h3" size="md" color="green.600">
            Culturas da Safra {folder.ano_culturas}/{folder.ano_culturas + 1}
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Pasta #{folder.id}
          </Text>
        </VStack>
      </Flex>

      <Box minH="280px" maxH="60vh" overflowY="auto" p={1}>
        {isLoading ? (
          <Center h="200px" flexDirection="column" gap={2}>
            <Spinner color="green.500" />
            <Text fontSize="sm" color="gray.500">
              Carregando culturas...
            </Text>
          </Center>
        ) : crops.length === 0 ? (
          <Center h="200px">
            <Text color="gray.500" fontStyle="italic">
              Nenhuma cultura cadastrada nesta pasta.
            </Text>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
            {crops.map((crop) => (
              <Box
                key={crop.id}
                p={4}
                bg="white"
                _dark={{ bg: "gray.700" }}
                borderWidth="1px"
                borderColor={activeCropId === crop.id ? "green.500" : "gray.200"}
                borderRadius="md"
                boxShadow="sm"
                cursor="pointer"
                position="relative"
                transition="all 0.2s"
                _hover={{ borderColor: "green.400", boxShadow: "md" }}
                onClick={() => setActiveCropId(crop.id)}
                display="flex"
                flexDirection="column"
                gap={2}
              >
                <Flex justify="space-between" align="center">
                  <VStack align="start" gap={0}>
                    <Text fontWeight="bold" fontSize="md" color="gray.700" _dark={{ color: "white" }}>
                      {crop.nome.replace(/_/g, " ")}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {crop.variedade}
                    </Text>
                  </VStack>
                  <Badge colorPalette={crop.tipo_cultivo === "SAFRA" ? "green" : "orange"}>
                    {crop.tipo_cultivo}
                  </Badge>
                </Flex>

                <Text fontSize="xs" color="gray.500">
                  Plantio: {formatDate(crop.data_plantio)}
                </Text>

                {activeCropId === crop.id && (
                  <Flex
                    position="absolute"
                    inset={0}
                    bg="blackAlpha.700"
                    borderRadius="md"
                    align="center"
                    justify="center"
                    animation="fade-in 0.2s"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Button
                      size="sm"
                      colorScheme="green"
                      leftIcon={<FiEye />}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectCrop(crop);
                      }}
                    >
                      Visualizar Dados
                    </Button>
                  </Flex>
                )}
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

      <Flex justify="flex-end" mt={6}>
        <Button onClick={onClose} colorScheme="red" variant="outline">
          Fechar
        </Button>
      </Flex>
    </DialogContainer>
  );
};