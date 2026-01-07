// src/pages/fertilization-table/CropFertilizationTable.tsx

import { useState } from "react";
import { Box, Button, Flex, Heading, Spinner, Text, useDisclosure, VStack } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import { toaster } from "@/components/ui/toaster";
import DialogContainer from "@/components/Property/DialogContainer"; 
import DeletePropertyDialog from "@/components/Property/DeletePropertyDialog"; 

import FertilizationTableFormFields from "@/components/FertilizationTable/FertilizationTableFormFields";
import { DEFAULT_TABLE_STATE, FertilizationTableFormState } from "@/components/FertilizationTable/types";
import { 
    createCropFertilizationTable, 
    deleteCropFertilizationTable, 
    fetchCropFertilizationTables, 
    updateCropFertilizationTable 
} from "@/services/cropFertilizationTableService";
import { CropFertilizationTableResponseDto, CropFertilizationTableCreateRequestDto } from "@/interfaces/CropFertilizationTable";

// Mappers para converter entre Estado do Formulário (Front) e DTO (Back)
const mapResponseToForm = (dto: CropFertilizationTableResponseDto): FertilizationTableFormState => {
    // Implementar lógica para transformar a resposta da API no formato do formulário
    // Ex: mapear contentRanges para faixasP e faixasK baseado no nutriente
    const faixasP = dto.contentRanges.filter(r => r.nutrient === 'P2O5').map(r => ({
        id: String(r.id || Math.random()), 
        label: r.operatorLabel, 
        plantio: String(r.plantioValue), 
        coberturas: r.coverageValues.map(String)
    }));
    // ... repetir para K e N (N é fixo na estrutura do form)
    
    return {
        ...dto,
        id: dto.id,
        nomeComum: dto.nomeComum,
        // ... mapear campos simples
        produtividadeRegional: String(dto.produtividadeRegional),
        produtividadeEsperada: String(dto.produtividadeEsperada),
        // ... mapear tabelas
        coberturaLabels: dto.coverages.map(c => c.label),
        faixasP,
        // ... (Completar conforme estrutura do types.ts definido anteriormente)
    } as any;
};

const mapFormToRequest = (form: FertilizationTableFormState): CropFertilizationTableCreateRequestDto => {
    // Implementar lógica inversa: pegar o form e montar o JSON para o backend
    return {
        nomeComum: form.nomeComum,
        nomeCientifico: form.nomeCientifico,
        // ... outros campos
        coverages: form.coberturaLabels.map((label, index) => ({ label, orderIndex: index })),
        contentRanges: [
            // Converter faixasP, faixasK e a linha de N para objetos ContentRangeDto
        ]
    } as any;
};

export default function CropFertilizationTable() {
    const queryClient = useQueryClient();
    
    const addDisclosure = useDisclosure();
    const editDisclosure = useDisclosure();
    const deleteDisclosure = useDisclosure();
    const viewDisclosure = useDisclosure();

    const [createForm, setCreateForm] = useState<FertilizationTableFormState>(DEFAULT_TABLE_STATE);
    const [editForm, setEditForm] = useState<FertilizationTableFormState>(DEFAULT_TABLE_STATE);
    const [activeTable, setActiveTable] = useState<CropFertilizationTableResponseDto | null>(null);

    // Queries
    const { data: tables = [], isLoading, isError } = useQuery({
        queryKey: ['crop-fertilization-tables'],
        queryFn: fetchCropFertilizationTables,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: createCropFertilizationTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crop-fertilization-tables'] });
            addDisclosure.onClose();
            setCreateForm(DEFAULT_TABLE_STATE);
            toaster.create({ title: "Tabela criada com sucesso.", type: "success" });
        },
        onError: () => toaster.create({ title: "Erro ao criar tabela.", type: "error" })
    });

    const updateMutation = useMutation({
        mutationFn: updateCropFertilizationTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crop-fertilization-tables'] });
            editDisclosure.onClose();
            toaster.create({ title: "Tabela atualizada com sucesso.", type: "success" });
        },
        onError: () => toaster.create({ title: "Erro ao atualizar tabela.", type: "error" })
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCropFertilizationTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crop-fertilization-tables'] });
            deleteDisclosure.onClose();
            toaster.create({ title: "Tabela removida.", type: "success" });
        },
        onError: () => toaster.create({ title: "Erro ao remover tabela.", type: "error" })
    });

    // Handlers
    const handleCreate = () => {
        const payload = mapFormToRequest(createForm);
        createMutation.mutate(payload);
    };

    const handleUpdate = () => {
        if (!activeTable) return;
        const payload = mapFormToRequest(editForm);
        updateMutation.mutate({ id: activeTable.id, payload });
    };

    const handleDelete = () => {
        if (activeTable) deleteMutation.mutate(activeTable.id);
    };

    const openEdit = (table: CropFertilizationTableResponseDto) => {
        setActiveTable(table);
        setEditForm(mapResponseToForm(table));
        editDisclosure.onOpen();
    };

    const handleFormChange = (setter: React.Dispatch<React.SetStateAction<FertilizationTableFormState>>) => 
        (field: keyof FertilizationTableFormState, value: any) => {
        setter(prev => ({ ...prev, [field]: value }));
    };

    return (
        <UserLayout>
            <FertName subtitle="Tabelas de Adubação" />
            <ConfigMenu />

            <Box pt={{ base: 16, md: 24 }} px={{ base: 4, md: 8 }} w="full">
                <Flex direction="column" gap={6}>
                    <Heading as="h1" size="lg" color="white">
                        Gerenciar Tabelas de Cultura
                    </Heading>

                    <Button
                        alignSelf="flex-start"
                        colorScheme="green"
                        onClick={addDisclosure.onOpen}
                        display="inline-flex"
                        alignItems="center"
                        gap={2}
                    >
                        <FiPlus /> Nova Tabela
                    </Button>

                    <Box mt={2}>
                        {isLoading ? (
                            <Flex justify="center"><Spinner color="white" /></Flex>
                        ) : isError ? (
                            <Text color="red.300">Erro ao carregar tabelas.</Text>
                        ) : tables.length === 0 ? (
                            <Text color="white">Nenhuma tabela cadastrada.</Text>
                        ) : (
                            <Flex wrap="wrap" gap={4}>
                                {tables.map(table => (
                                    <Box key={table.id} p={4} bg="white" _dark={{ bg: "gray.700" }} borderRadius="md" shadow="md" minW="250px">
                                        <Text fontWeight="bold" fontSize="lg">{table.nomeComum}</Text>
                                        <Text fontSize="sm" color="gray.500" fontStyle="italic">{table.nomeCientifico}</Text>
                                        <Flex mt={4} gap={2}>
                                            <Button size="xs" onClick={() => openEdit(table)}>Editar</Button>
                                            <Button size="xs" colorScheme="red" onClick={() => { setActiveTable(table); deleteDisclosure.onOpen(); }}>Excluir</Button>
                                        </Flex>
                                    </Box>
                                ))}
                            </Flex>
                        )}
                    </Box>
                </Flex>
            </Box>

            {/* Modais de Criação e Edição */}
            <DialogContainer isOpen={addDisclosure.open} onClose={addDisclosure.onClose}>
                <Heading as="h2" size="md" mb={4}>Criar Tabela</Heading>
                <FertilizationTableFormFields form={createForm} onFormChange={handleFormChange(setCreateForm)} />
                <Flex justify="flex-end" gap={3} mt={6}>
                    <Button onClick={addDisclosure.onClose} colorScheme="red" variant="outline">Cancelar</Button>
                    <Button colorScheme="green" onClick={handleCreate} isLoading={createMutation.isPending}>Salvar</Button>
                </Flex>
            </DialogContainer>

            <DialogContainer isOpen={editDisclosure.open} onClose={editDisclosure.onClose}>
                <Heading as="h2" size="md" mb={4}>Editar Tabela</Heading>
                <FertilizationTableFormFields form={editForm} onFormChange={handleFormChange(setEditForm)} />
                <Flex justify="flex-end" gap={3} mt={6}>
                    <Button onClick={editDisclosure.onClose} colorScheme="red" variant="outline">Cancelar</Button>
                    <Button colorScheme="green" onClick={handleUpdate} isLoading={updateMutation.isPending}>Salvar</Button>
                </Flex>
            </DialogContainer>

            <DeletePropertyDialog 
                isOpen={deleteDisclosure.open} 
                onClose={deleteDisclosure.onClose} 
                onConfirm={handleDelete} 
                isDeleting={deleteMutation.isPending} 
            />
        </UserLayout>
    );
}