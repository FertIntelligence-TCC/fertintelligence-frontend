import { useEffect, useState } from "react";
import { VStack } from "@chakra-ui/react";
import { Button } from "@/components/ui/button"; // Ajuste o import conforme sua estrutura de UI
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog"; // Componentes do seu projeto
import { Field } from "@/components/ui/field"; // Componente de campo do seu projeto
import { toaster } from "@/components/ui/toaster"; // Sistema de notificação do projeto
import {
  AnnualCropFolderResponseDto,
} from "@/interfaces/AnnualCropFolder";
import {
  createAnnualCropFolder,
  updateAnnualCropFolder,
} from "@/services/annualCropFolderService";

interface AnnualCropFolderFormDialogProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  plotId: number; // ID do Talhão Pai
  selectedFolder?: AnnualCropFolderResponseDto | null; // Se existir, é edição
  onSuccess: () => void; // Callback para recarregar a lista
}

export const AnnualCropFolderFormDialog = ({
  open,
  onOpenChange,
  plotId,
  selectedFolder,
  onSuccess,
}: AnnualCropFolderFormDialogProps) => {
  const [year, setYear] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Preenche o formulário se for edição
  useEffect(() => {
    if (open) {
      if (selectedFolder) {
        setYear(selectedFolder.ano_culturas.toString());
      } else {
        setYear("");
      }
    }
  }, [open, selectedFolder]);

  const handleSubmit = async () => {
    // Validação Simples
    const yearNumber = parseInt(year);
    if (!year || isNaN(yearNumber) || yearNumber < 1900 || yearNumber > 2100) {
      toaster.create({
        title: "Ano inválido",
        description: "Por favor, insira um ano agrícola válido (ex: 2024).",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (selectedFolder) {
        // Edição (PUT)
        await updateAnnualCropFolder(selectedFolder.id, {
          novo_ano_culturas: yearNumber,
        });
        toaster.create({
          title: "Pasta atualizada",
          description: "A pasta de safras foi atualizada com sucesso.",
          type: "success",
        });
      } else {
        // Criação (POST)
        await createAnnualCropFolder(plotId, {
          ano_culturas: yearNumber,
        });
        toaster.create({
          title: "Pasta criada",
          description: "Nova pasta de safras criada com sucesso.",
          type: "success",
        });
      }

      onSuccess();
      onOpenChange({ open: false });
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao tentar salvar a pasta. Tente novamente.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange} placement="center">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedFolder
              ? "Editar Pasta de Safra"
              : "Nova Pasta de Safra"}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <VStack gap={4} align="stretch">
            <Field
              label="Ano Agrícola (Início da Safra)"
              invalid={!year && false} // Lógica de validação visual se desejar
              helperText="Ex: Digite 2023 para representar a safra 2023/2024."
            >
              <input
                className="chakra-input css-1" // Ou use o componente <Input /> do Chakra diretamente
                type="number"
                placeholder="Ex: 2024"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #E2E8F0",
                }}
              />
            </Field>
          </VStack>
        </DialogBody>

        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancelar
            </Button>
          </DialogActionTrigger>
          <Button onClick={handleSubmit} loading={isLoading}>
            {selectedFolder ? "Salvar Alterações" : "Criar Pasta"}
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};