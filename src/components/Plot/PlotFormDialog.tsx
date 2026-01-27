import { useEffect, useState } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import {
    Button,
    Heading,
    Input,
    VStack,
    Grid,
    Text,
    Box,
    createListCollection,
    Separator,
    Flex
} from "@chakra-ui/react";
import {
    SelectContent,
    SelectItem,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
} from "@/components/ui/select";

import DialogContainer from "@/components/Property/DialogContainer";
import { 
    ClasseSolo, 
    TexturaSolo, 
    AreaIrrigada, 
    PlotCreatePayload, 
    PlotResponse 
} from "@/interfaces/Plot";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: PlotCreatePayload) => void;
    initialData?: PlotResponse | null;
    isSubmitting: boolean;
};

const INITIAL_STATE: PlotCreatePayload = {
    identificacao: "",
    area: 0,
    classe_solo: ClasseSolo.LATOSSOLO,
    textura_solo: TexturaSolo.ARGILA,
    ano_incorporacao_safra: new Date().getFullYear(),
    area_irrigada: AreaIrrigada.NAO,
    declividade: 0,
    pluviosidade_mensal: 0,
    pluviosidade_anual: 0
};

const classesSoloCollection = createListCollection({
    items: Object.values(ClasseSolo).map((item) => ({ label: item, value: item })),
});

const texturasSoloCollection = createListCollection({
    items: Object.values(TexturaSolo).map((item) => ({ label: item, value: item })),
});

const areaIrrigadaCollection = createListCollection({
    items: [
        { label: "Sim", value: AreaIrrigada.SIM },
        { label: "Não", value: AreaIrrigada.NAO },
    ],
});

export default function PlotFormDialog({ isOpen, onClose, onSubmit, initialData, isSubmitting }: Props) {
    const [form, setForm] = useState<PlotCreatePayload>(INITIAL_STATE);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setForm({
                    identificacao: initialData.identificacao,
                    area: initialData.area,
                    classe_solo: initialData.classe_solo,
                    textura_solo: initialData.textura_solo,
                    ano_incorporacao_safra: initialData.ano_incorporacao_safra,
                    area_irrigada: initialData.area_irrigada,
                    declividade: initialData.declividade,
                    pluviosidade_mensal: initialData.pluviosidade_mensal,
                    pluviosidade_anual: initialData.pluviosidade_anual
                });
            } else {
                setForm(INITIAL_STATE);
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (field: keyof PlotCreatePayload, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // CORREÇÃO: Recebe o evento para prevenir comportamento padrão (submit/refresh)
    const handleNavigate = (e: React.MouseEvent, routeTemplate: string) => {
        e.preventDefault();  // Impede o envio do formulário
        e.stopPropagation(); // Impede a propagação do clique para elementos pai
        
        if (initialData?.id) {
            onClose(); // Fecha o modal atual
            // Navega para a rota absoluta correta
            navigate(generatePath(routeTemplate, { plotId: initialData.id }));
        }
    };

    const plotEntityRoutes = {
        physicalAnalysis: "/fertintelligence/plots/:plotId/physical-analysis",
        fertilityAnalysis: "/fertintelligence/plots/:plotId/fertility-analysis",
        saturationExtract: "/fertintelligence/plots/:plotId/saturation-extract",
        annualCropFolder: "/fertintelligence/plots/:plotId/annual-crop-folders",
    };

    return (
        // zIndex alto para garantir que o modal fique sobreposto corretamente
        <DialogContainer isOpen={isOpen} onClose={onClose} zIndex={1400}>
            <Heading as="h2" size="md" mb={4}>
                {initialData ? "Editar Talhão" : "Novo Talhão"}
            </Heading>
            
            <VStack gap={4} align="stretch">
                <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={1}>Identificação</Text>
                    <Input 
                        value={form.identificacao} 
                        onChange={e => handleChange("identificacao", e.target.value)} 
                        placeholder="Ex: Talhão Norte"
                    />
                </Box>

                <Grid templateColumns="1fr 1fr" gap={4}>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Área (ha)</Text>
                        <Input 
                            type="number" 
                            value={form.area} 
                            onChange={e => handleChange("area", parseFloat(e.target.value))} 
                        />
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Ano Safra</Text>
                        <Input 
                            type="number" 
                            value={form.ano_incorporacao_safra} 
                            onChange={e => handleChange("ano_incorporacao_safra", parseInt(e.target.value))} 
                        />
                    </Box>
                </Grid>

                <Grid templateColumns="1fr 1fr" gap={4}>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Classe de Solo</Text>
                        <SelectRoot
                            collection={classesSoloCollection}
                            value={[form.classe_solo]}
                            onValueChange={(e) => handleChange("classe_solo", e.value[0])}
                        >
                            <SelectTrigger>
                                <SelectValueText placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent zIndex={1500}>
                                {classesSoloCollection.items.map((item) => (
                                    <SelectItem item={item} key={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </SelectRoot>
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Textura</Text>
                        <SelectRoot
                            collection={texturasSoloCollection}
                            value={[form.textura_solo]}
                            onValueChange={(e) => handleChange("textura_solo", e.value[0])}
                        >
                            <SelectTrigger>
                                <SelectValueText placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent zIndex={1500}>
                                {texturasSoloCollection.items.map((item) => (
                                    <SelectItem item={item} key={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </SelectRoot>
                    </Box>
                </Grid>

                <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={1}>Área Irrigada?</Text>
                    <SelectRoot
                        collection={areaIrrigadaCollection}
                        value={[form.area_irrigada]}
                        onValueChange={(e) => handleChange("area_irrigada", e.value[0])}
                    >
                        <SelectTrigger>
                            <SelectValueText placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent zIndex={1500}>
                            {areaIrrigadaCollection.items.map((item) => (
                                <SelectItem item={item} key={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </SelectRoot>
                </Box>

                <Grid templateColumns="1fr 1fr 1fr" gap={4}>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Decliv. (%)</Text>
                        <Input type="number" value={form.declividade} onChange={e => handleChange("declividade", parseFloat(e.target.value))} />
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Pluv. Mês (mm)</Text>
                        <Input type="number" value={form.pluviosidade_mensal} onChange={e => handleChange("pluviosidade_mensal", parseFloat(e.target.value))} />
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Pluv. Ano (mm)</Text>
                        <Input type="number" value={form.pluviosidade_anual} onChange={e => handleChange("pluviosidade_anual", parseFloat(e.target.value))} />
                    </Box>
                </Grid>

                {/* --- SEÇÃO DE GERENCIAMENTO DE ENTIDADES --- */}
                {initialData && (
                    <>
                        <Separator my={2} borderColor="gray.300" />
                        <Text fontSize="md" fontWeight="bold" color="gray.700">
                            Gerenciar Dados do Talhão
                        </Text>
                        <VStack gap={3} width="100%">
                            <Button 
                                type="button" 
                                variant="outline" 
                                width="100%" 
                                onClick={(e) => handleNavigate(e, plotEntityRoutes.physicalAnalysis)}
                            >
                                Gerenciar Análises Físicas
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline" 
                                width="100%" 
                                onClick={(e) => handleNavigate(e, plotEntityRoutes.fertilityAnalysis)}
                            >
                                Gerenciar Análises de Fertilidade
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline" 
                                width="100%" 
                                onClick={(e) => handleNavigate(e, plotEntityRoutes.saturationExtract)}
                            >
                                Gerenciar Análises de Extrato de Saturação
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline" 
                                width="100%" 
                                onClick={(e) => handleNavigate(e, plotEntityRoutes.annualCropFolder)}
                            >
                                Gerenciar Pastas de Culturas Anuais
                            </Button>
                        </VStack>
                    </>
                )}

            </VStack>

            <Flex justify="flex-end" gap={3} mt={6}>
                <Button onClick={onClose} variant="outline" colorPalette="red">Cancelar</Button>
                {/* O botão Salvar mantém o comportamento padrão de submit */}
                <Button onClick={() => onSubmit(form)} colorPalette="green" loading={isSubmitting}>Salvar</Button>
            </Flex>
        </DialogContainer>
    );
}