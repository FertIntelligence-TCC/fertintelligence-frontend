import { useState } from "react";
import { Button, Flex, Heading, Text, VStack, useDisclosure, Box, Separator, HStack } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toaster } from "@/components/ui/toaster";

import DialogContainer from "./DialogContainer";
import PropertyFormFields from "./PropertyFormFields";
import PlotList from "@/components/Plot/PlotList";
import PlotFormDialog from "@/components/Plot/PlotFormDialog";

import { PropertyFormState } from "./types";
import { getPlotsByProperty, createPlot, updatePlot, deletePlot } from "@/services/plotService";
import { PlotResponse, PlotCreatePayload } from "@/interfaces/Plot";

type PropertyFormDialogProps = {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    canSubmit: boolean;
    form: PropertyFormState;
    onFormChange: <Field extends keyof PropertyFormState>(field: Field, value: PropertyFormState[Field]) => void;
    submitLabel?: string;
    cancelLabel?: string;
    propertyId?: number;
};

const PropertyFormDialog = ({
    title, isOpen, onClose, onSubmit, isSubmitting, canSubmit,
    form, onFormChange, submitLabel = "Concluir", cancelLabel = "Cancelar", propertyId
}: PropertyFormDialogProps) => {
    
    const queryClient = useQueryClient();
    const plotFormDisclosure = useDisclosure();
    const [editingPlot, setEditingPlot] = useState<PlotResponse | null>(null);

    const { data: plots = [] } = useQuery({
        queryKey: ["plots", propertyId],
        queryFn: () => propertyId ? getPlotsByProperty(propertyId) : Promise.resolve([]),
        enabled: !!propertyId && isOpen
    });

    const createPlotMutation = useMutation({
        mutationFn: (payload: PlotCreatePayload) => createPlot(propertyId!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plots", propertyId] });
            plotFormDisclosure.onClose();
            toaster.create({ title: "Talhão criado com sucesso!", type: "success" });
        },
        onError: () => toaster.create({ title: "Erro ao criar talhão.", type: "error" })
    });

    const updatePlotMutation = useMutation({
        mutationFn: (payload: { id: number, data: PlotCreatePayload }) => updatePlot(payload.id, payload.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plots", propertyId] });
            plotFormDisclosure.onClose();
            toaster.create({ title: "Talhão atualizado com sucesso!", type: "success" });
        },
        onError: () => toaster.create({ title: "Erro ao atualizar talhão.", type: "error" })
    });

    const deletePlotMutation = useMutation({
        mutationFn: (id: number) => deletePlot(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plots", propertyId] });
            toaster.create({ title: "Talhão removido com sucesso!", type: "success" });
        },
        onError: () => toaster.create({ title: "Erro ao remover talhão.", type: "error" })
    });

    const handleAddPlot = () => {
        setEditingPlot(null);
        plotFormDisclosure.onOpen();
    };

    const handleEditPlot = (plot: PlotResponse) => {
        setEditingPlot(plot);
        plotFormDisclosure.onOpen();
    };

    const handleSavePlot = (payload: PlotCreatePayload) => {
        if (editingPlot) {
            updatePlotMutation.mutate({ id: editingPlot.id, data: payload });
        } else {
            createPlotMutation.mutate(payload);
        }
    };

    return (
        <>
            <DialogContainer isOpen={isOpen} onClose={onClose}>
                <Heading as="h2" size="md" mb={4}>{title}</Heading>
                
                <VStack align="stretch" gap={6}>
                    <PropertyFormFields form={form} onFormChange={onFormChange} />

                    <Separator />

                    {propertyId && (
                        <Box>
                            <Flex justify="space-between" align="center" mb={2}>
                                <Heading as="h4" size="sm" color="gray.600">Talhões</Heading>
                                {/* CORREÇÃO: Botão sem leftIcon, usando children */}
                                <Button size="xs" colorScheme="blue" onClick={handleAddPlot}>
                                    <HStack gap={1}>
                                        <FiPlus />
                                        <Text>Adicionar Talhão</Text>
                                    </HStack>
                                </Button>
                            </Flex>
                            
                            <PlotList 
                                plots={plots} 
                                mode="edit" 
                                onEdit={handleEditPlot}
                                onDelete={(p) => deletePlotMutation.mutate(p.id)}
                            />
                        </Box>
                    )}
                </VStack>

                <Flex justify="flex-end" gap={3} mt={6}>
                    <Button onClick={onClose} colorScheme="red" variant="outline">{cancelLabel}</Button>
                    <Button colorScheme="green" onClick={onSubmit} loading={isSubmitting} disabled={!canSubmit}>
                        {submitLabel}
                    </Button>
                </Flex>
            </DialogContainer>

            {/* Renderiza o modal de Talhão por cima do modal de Propriedade */}
            <PlotFormDialog 
                isOpen={plotFormDisclosure.isOpen}
                onClose={plotFormDisclosure.onClose}
                onSubmit={handleSavePlot}
                initialData={editingPlot}
                isSubmitting={createPlotMutation.isPending || updatePlotMutation.isPending}
            />
        </>
    );
};

export default PropertyFormDialog;