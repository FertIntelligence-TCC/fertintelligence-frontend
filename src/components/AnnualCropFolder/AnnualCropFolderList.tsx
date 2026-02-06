import {
  Box,
  Button,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Spinner,
  Flex,
  Badge,
  IconButton,
  Separator,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { LuFolderOpen, LuPencil, LuTrash2 } from "react-icons/lu";
import { AnnualCropFolderResponseDto } from "@/interfaces/AnnualCropFolder";

interface AnnualCropFolderListProps {
  folders: AnnualCropFolderResponseDto[];
  isLoading: boolean;
  onEdit: (folder: AnnualCropFolderResponseDto) => void;
  onManage: (folder: AnnualCropFolderResponseDto) => void;
  onRefresh: () => void;
}

export const AnnualCropFolderList = ({
  folders,
  isLoading,
  onEdit,
  onManage,
}: AnnualCropFolderListProps) => {
  
  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (folders.length === 0) {
    return (
      <Flex 
        direction="column" 
        align="center" 
        justify="center" 
        p={10} 
        borderWidth="1px" 
        borderRadius="lg" 
        borderStyle="dashed"
        bg="bg.panel"
      >
        <Box fontSize="4xl" mb={4}>📂</Box>
        <Text fontSize="lg" fontWeight="medium" color="gray.600">
          Nenhuma pasta encontrada
        </Text>
        <Text color="gray.500">
          Crie uma nova pasta para começar a organizar suas safras.
        </Text>
      </Flex>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
      {folders.map((folder) => (
        <Box
          key={folder.id}
          borderWidth="1px"
          borderRadius="lg"
          bg="bg.panel"
          shadow="sm"
          _hover={{ shadow: "md", borderColor: "green.400" }}
          transition="all 0.2s"
          overflow="hidden"
        >
          <Box p={5}>
            {/* Cabeçalho do Card */}
            <Flex justify="space-between" align="start" mb={4}>
              <HStack gap={3}>
                <Box 
                  p={2} 
                  bg="green.100" 
                  color="green.700" 
                  rounded="md"
                >
                  <LuFolderOpen size={24} />
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontWeight="semibold" fontSize="md">
                    Safra {folder.ano_culturas}/{folder.ano_culturas + 1}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    ID: {folder.id}
                  </Text>
                </VStack>
              </HStack>
              <Badge colorPalette="blue" variant="subtle">Ativo</Badge>
            </Flex>

            <Separator mb={4} />

            {/* Rodapé com Ações */}
            <Flex justify="space-between" align="center">
              <Button 
                type="button" // CRÍTICO: Evita submit/refresh
                variant="ghost" 
                size="sm" 
                colorPalette="green"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onManage(folder);
                }}
              >
                Abrir Pasta
              </Button>

              <HStack gap={1}>
                <IconButton
                  type="button" // CRÍTICO: Evita submit/refresh
                  aria-label="Editar"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit(folder);
                  }}
                >
                  <LuPencil />
                </IconButton>
                
                <IconButton
                  type="button" // CRÍTICO: Evita submit/refresh
                  aria-label="Excluir"
                  variant="ghost"
                  colorPalette="red"
                  size="sm"
                  onClick={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     // Aqui usamos um toaster informativo caso a prop onDelete não venha do pai,
                     // mas idealmente você passaria onDelete={handleDelete} para este componente.
                     toaster.create({ 
                        title: "Use o botão da página anterior para deletar", 
                        type: "info" 
                     });
                  }}
                >
                  <LuTrash2 />
                </IconButton>
              </HStack>
            </Flex>
          </Box>
        </Box>
      ))}
    </SimpleGrid>
  );
};