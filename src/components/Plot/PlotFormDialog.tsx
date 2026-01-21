import { useEffect, useState } from "react";
import {
    Button,
    Flex,
    Heading,
    Input,
    VStack,
    Grid,
    Text,
    Box,
    createListCollection
} from "@chakra-ui/react";
import {
    SelectContent,
    SelectItem,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
} from "@/components/ui/select";
console.log("SelectRoot typeof:", typeof SelectRoot, SelectRoot)
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

    return (
        // CORREÇÃO: zIndex maior que o modal pai (1400 > 1000)
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
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Ano de Incorporação da Safra</Text>
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
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Textura do Solo</Text>
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
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Pluv. Mensal (mm)</Text>
                        <Input type="number" value={form.pluviosidade_mensal} onChange={e => handleChange("pluviosidade_mensal", parseFloat(e.target.value))} />
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Pluv. Anual (mm)</Text>
                        <Input type="number" value={form.pluviosidade_anual} onChange={e => handleChange("pluviosidade_anual", parseFloat(e.target.value))} />
                    </Box>
                </Grid>
            </VStack>

            <Flex justify="flex-end" gap={3} mt={6}>
                <Button onClick={onClose} variant="outline" colorScheme="red">Cancelar</Button>
                <Button onClick={() => onSubmit(form)} colorScheme="green" loading={isSubmitting}>Salvar</Button>
            </Flex>
        </DialogContainer>
    );
}