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
} from "@chakra-ui/react";
import { FiEye } from "react-icons/fi";
import { toaster } from "@/components/ui/toaster";
import DialogContainer from "@/components/Property/DialogContainer";
import { AnnualCropFolderResponseDto } from "@/interfaces/AnnualCropFolder";
import { getAllAnnualCropFoldersByPlot } from "@/services/annualCropFolderService";

interface AnnualCropFolderListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plotId: number;
  onSelectFolder: (folder: AnnualCropFolderResponseDto) => void;
}

export const AnnualCropFolderListDialog = ({
  isOpen,
  onClose,
  plotId,
  onSelectFolder,
}: AnnualCropFolderListDialogProps) => {
  const [folders, setFolders] = useState<AnnualCropFolderResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || !plotId) return;

    const fetchFolders = async () => {
      setIsLoading(true);
      try {
        const data = await getAllAnnualCropFoldersByPlot(plotId);
        const sorted = data.sort((a, b) => b.ano_culturas - a.ano_culturas);
        setFolders(sorted);
      } catch (error) {
        console.error(error);
        toaster.create({
          title: "Erro ao carregar",
          description: "Não foi possível carregar as pastas de culturas anuais.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolders();
  }, [isOpen, plotId]);

  if (!isOpen) return null;

  return (
    <DialogContainer isOpen={isOpen} onClose={onClose} zIndex={1400}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h3" size="md" color="green.600">
          Pastas de Culturas Anuais
        </Heading>
      </Flex>

      <Box minH="280px" maxH="60vh" overflowY="auto" p={1}>
        {isLoading ? (
          <Center h="200px" flexDirection="column" gap={2}>
            <Spinner color="green.500" />
            <Text fontSize="sm" color="gray.500">
              Carregando pastas...
            </Text>
          </Center>
        ) : folders.length === 0 ? (
          <Center h="200px">
            <Text color="gray.500" fontStyle="italic">
              Nenhuma pasta encontrada para este talhão.
            </Text>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
            {folders.map((folder) => (
              <Box
                key={folder.id}
                p={4}
                bg="white"
                _dark={{ bg: "gray.700" }}
                borderWidth="1px"
                borderColor={
                  activeFolderId === folder.id ? "green.500" : "gray.200"
                }
                borderRadius="md"
                boxShadow="sm"
                cursor="pointer"
                position="relative"
                transition="all 0.2s"
                _hover={{ borderColor: "green.400", boxShadow: "md" }}
                onClick={() => setActiveFolderId(folder.id)}
                h="110px"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
              >
                <Text fontWeight="bold" fontSize="lg" color="gray.700" _dark={{ color: "white" }}>
                  Safra {folder.ano_culturas}/{folder.ano_culturas + 1}
                </Text>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Pasta #{folder.id}
                </Text>

                {activeFolderId === folder.id && (
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
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectFolder(folder);
                      }}
                    >
                      <FiEye />
                      Visualizar Culturas
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
