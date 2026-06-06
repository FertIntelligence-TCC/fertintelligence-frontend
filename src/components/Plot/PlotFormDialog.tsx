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
import EntityImageUploader from "@/components/EntityImageUploader";
import { 
    ClasseSolo, 
    TexturaSolo, 
    AreaIrrigada, 
    PlotCreatePayload, 
    PlotResponse 
} from "@/interfaces/Plot";
import { LatitudeDirection, LongitudeDirection } from "@/interfaces/Property";
import { decimalToDms, dmsToDecimal } from "@/components/Property/types";

// Importações para verificar permissões
import { useUserStore } from "@/stores/user/user.store";
import { getAuthorizationRoleMode } from "@/interfaces/Authorization";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: PlotCreatePayload) => void;
    initialData?: PlotResponse | null;
    isSubmitting: boolean;
};

type PlotFormState = Omit<
    PlotCreatePayload,
    "latitude" | "latitudeDirection" | "longitude" | "longitudeDirection"
> & {
    latitudeDegrees: string;
    latitudeMinutes: string;
    latitudeSeconds: string;
    latitudeDirection: string;
    longitudeDegrees: string;
    longitudeMinutes: string;
    longitudeSeconds: string;
    longitudeDirection: string;
};

const INITIAL_STATE: PlotFormState = {
    identificacao: "",
    area: 0,
    classe_solo: ClasseSolo.LATOSSOLO,
    textura_solo: TexturaSolo.ARGILA,
    ano_incorporacao_safra: new Date().getFullYear(),
    area_irrigada: AreaIrrigada.NAO,
    declividade: 0,
    pluviosidade_mensal: 0,
    pluviosidade_anual: 0,
    latitudeDegrees: "",
    latitudeMinutes: "",
    latitudeSeconds: "",
    latitudeDirection: LatitudeDirection.SUL,
    longitudeDegrees: "",
    longitudeMinutes: "",
    longitudeSeconds: "",
    longitudeDirection: LongitudeDirection.OESTE,
    altitude: undefined,
    idfoto: "",
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

const latitudeDirectionCollection = createListCollection({
    items: [
        { label: "Norte", value: LatitudeDirection.NORTE },
        { label: "Sul", value: LatitudeDirection.SUL },
    ],
});

const longitudeDirectionCollection = createListCollection({
    items: [
        { label: "Leste", value: LongitudeDirection.LESTE },
        { label: "Oeste", value: LongitudeDirection.OESTE },
    ],
});

const sanitizeNumberText = (value: string, max?: number) => {
    const cleaned = value.replace(/[^\d.]/g, "");
    if (!cleaned) return "";

    const numeric = Number(cleaned);
    if (Number.isNaN(numeric)) return "";

    if (typeof max === "number" && numeric > max) return String(max);
    return cleaned;
};

const dmsToOptionalDecimal = (degrees: string, minutes: string, seconds: string) => {
    if (!degrees && !minutes && !seconds) return undefined;
    return dmsToDecimal(degrees, minutes, seconds);
};

export default function PlotFormDialog({ isOpen, onClose, onSubmit, initialData, isSubmitting }: Props) {
    const [form, setForm] = useState<PlotFormState>(INITIAL_STATE);
    const navigate = useNavigate();

    // Verificação de permissões
    const { user } = useUserStore();
    const roleMode = getAuthorizationRoleMode(user?.cargo);
    const isSupreme = roleMode === "SUPREME";
    const isOwner = roleMode === "OWNER";
    const isManager = roleMode === "MANAGER";
    const isSecretary = roleMode === "SECRETARY";

    // Somente donos e gerentes editam os dados cadastrais do talhão
    const canEditMasterData = isSupreme || isOwner || isManager;
    const isReadOnly = !canEditMasterData;

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const latitude = decimalToDms(initialData.latitude);
                const longitude = decimalToDms(initialData.longitude);

                setForm({
                    identificacao: initialData.identificacao,
                    area: initialData.area,
                    classe_solo: initialData.classe_solo,
                    textura_solo: initialData.textura_solo,
                    ano_incorporacao_safra: initialData.ano_incorporacao_safra,
                    area_irrigada: initialData.area_irrigada,
                    declividade: initialData.declividade,
                    pluviosidade_mensal: initialData.pluviosidade_mensal,
                    pluviosidade_anual: initialData.pluviosidade_anual,
                    latitudeDegrees: latitude.degrees,
                    latitudeMinutes: latitude.minutes,
                    latitudeSeconds: latitude.seconds,
                    latitudeDirection: initialData.latitudeDirection ?? initialData.latitude_direction ?? LatitudeDirection.SUL,
                    longitudeDegrees: longitude.degrees,
                    longitudeMinutes: longitude.minutes,
                    longitudeSeconds: longitude.seconds,
                    longitudeDirection: initialData.longitudeDirection ?? initialData.longitude_direction ?? LongitudeDirection.OESTE,
                    altitude: initialData.altitude,
                    idfoto: initialData.idfoto ?? initialData.idFoto ?? initialData.id_foto ?? "",
                });
            } else {
                setForm(INITIAL_STATE);
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (field: keyof PlotFormState, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        onSubmit({
            identificacao: form.identificacao,
            area: form.area,
            classe_solo: form.classe_solo,
            textura_solo: form.textura_solo,
            ano_incorporacao_safra: form.ano_incorporacao_safra,
            area_irrigada: form.area_irrigada,
            declividade: form.declividade,
            pluviosidade_mensal: form.pluviosidade_mensal,
            pluviosidade_anual: form.pluviosidade_anual,
            latitude: dmsToOptionalDecimal(form.latitudeDegrees, form.latitudeMinutes, form.latitudeSeconds),
            latitudeDirection: form.latitudeDirection,
            longitude: dmsToOptionalDecimal(form.longitudeDegrees, form.longitudeMinutes, form.longitudeSeconds),
            longitudeDirection: form.longitudeDirection,
            altitude: form.altitude,
            idfoto: form.idfoto,
        });
    };

    const handleNavigate = (e: React.MouseEvent, routeTemplate: string) => {
        e.preventDefault(); 
        e.stopPropagation(); 
        
        if (initialData?.id) {
            onClose(); 
            navigate(generatePath(routeTemplate, { plotId: String(initialData.id) }));
        }
    };

    const plotEntityRoutes = {
        physicalAnalysis: "/fertintelligence/plots/:plotId/physical-analysis",
        fertilityAnalysis: "/fertintelligence/plots/:plotId/fertility-analysis",
        saturationExtract: "/fertintelligence/plots/:plotId/saturation-extract",
        annualCropFolder: "/fertintelligence/plots/:plotId/annual-crop-folders",
    };

    return (
        <DialogContainer isOpen={isOpen} onClose={onClose} zIndex={1400} expandable={!!initialData}>
            <Heading as="h2" size="md" mb={4}>
                {initialData ? (canEditMasterData ? "Editar Talhão" : "Gerenciar Recursos do Talhão") : "Novo Talhão"}
            </Heading>
            
            <VStack gap={4} align="stretch">
                <EntityImageUploader
                    label="Imagem do Talhão"
                    currentImageId={form.idfoto}
                    onImageIdChange={(id) => handleChange("idfoto", id)}
                    readOnly={isReadOnly}
                />
                <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={1}>Identificação</Text>
                    <Input 
                        disabled={isReadOnly}
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
                            disabled={isReadOnly}
                            value={form.area} 
                            onChange={e => handleChange("area", parseFloat(e.target.value))} 
                        />
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Ano Safra</Text>
                        <Input 
                            type="number" 
                            disabled={isReadOnly}
                            value={form.ano_incorporacao_safra} 
                            onChange={e => handleChange("ano_incorporacao_safra", parseInt(e.target.value))} 
                        />
                    </Box>
                </Grid>

                <Grid templateColumns="1fr 1fr" gap={4}>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Classe de Solo</Text>
                        <SelectRoot
                            disabled={isReadOnly}
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
                            disabled={isReadOnly}
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
                        disabled={isReadOnly}
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
                        <Input disabled={isReadOnly} type="number" value={form.declividade} onChange={e => handleChange("declividade", parseFloat(e.target.value))} />
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Pluv. Mês (mm)</Text>
                        <Input disabled={isReadOnly} type="number" value={form.pluviosidade_mensal} onChange={e => handleChange("pluviosidade_mensal", parseFloat(e.target.value))} />
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Pluv. Ano (mm)</Text>
                        <Input disabled={isReadOnly} type="number" value={form.pluviosidade_anual} onChange={e => handleChange("pluviosidade_anual", parseFloat(e.target.value))} />
                    </Box>
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Latitude - Graus</Text>
                        <Input
                            disabled={isReadOnly}
                            type="number"
                            min={0}
                            max={90}
                            value={form.latitudeDegrees}
                            onChange={e => handleChange("latitudeDegrees", sanitizeNumberText(e.target.value, 90))}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Minutos</Text>
                        <Input
                            disabled={isReadOnly}
                            type="number"
                            min={0}
                            max={59}
                            value={form.latitudeMinutes}
                            onChange={e => handleChange("latitudeMinutes", sanitizeNumberText(e.target.value, 59))}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Segundos</Text>
                        <Input
                            disabled={isReadOnly}
                            type="number"
                            min={0}
                            max={59}
                            step="0.01"
                            value={form.latitudeSeconds}
                            onChange={e => handleChange("latitudeSeconds", sanitizeNumberText(e.target.value, 59))}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Direção</Text>
                        <SelectRoot
                            disabled={isReadOnly}
                            collection={latitudeDirectionCollection}
                            value={[form.latitudeDirection]}
                            onValueChange={(e) => handleChange("latitudeDirection", e.value[0])}
                        >
                            <SelectTrigger>
                                <SelectValueText placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent zIndex={1500}>
                                {latitudeDirectionCollection.items.map((item) => (
                                    <SelectItem item={item} key={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </SelectRoot>
                    </Box>
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Longitude - Graus</Text>
                        <Input
                            disabled={isReadOnly}
                            type="number"
                            min={0}
                            max={180}
                            value={form.longitudeDegrees}
                            onChange={e => handleChange("longitudeDegrees", sanitizeNumberText(e.target.value, 180))}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Minutos</Text>
                        <Input
                            disabled={isReadOnly}
                            type="number"
                            min={0}
                            max={59}
                            value={form.longitudeMinutes}
                            onChange={e => handleChange("longitudeMinutes", sanitizeNumberText(e.target.value, 59))}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Segundos</Text>
                        <Input
                            disabled={isReadOnly}
                            type="number"
                            min={0}
                            max={59}
                            step="0.01"
                            value={form.longitudeSeconds}
                            onChange={e => handleChange("longitudeSeconds", sanitizeNumberText(e.target.value, 59))}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" mb={1}>Direção</Text>
                        <SelectRoot
                            disabled={isReadOnly}
                            collection={longitudeDirectionCollection}
                            value={[form.longitudeDirection]}
                            onValueChange={(e) => handleChange("longitudeDirection", e.value[0])}
                        >
                            <SelectTrigger>
                                <SelectValueText placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent zIndex={1500}>
                                {longitudeDirectionCollection.items.map((item) => (
                                    <SelectItem item={item} key={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </SelectRoot>
                    </Box>
                </Grid>

                <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={1}>Altitude</Text>
                    <Input
                        disabled={isReadOnly}
                        type="number"
                        value={form.altitude ?? ""}
                        onChange={e => handleChange("altitude", e.target.value === "" ? undefined : parseFloat(e.target.value))}
                        placeholder="Ex: 450"
                    />
                </Box>

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

                            {/* Oculta EDIÇÃO/CRIAÇÃO de Pastas de Culturas se for secretário */}
                            {!isSecretary && (
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    width="100%" 
                                    onClick={(e) => handleNavigate(e, plotEntityRoutes.annualCropFolder)}
                                >
                                    Gerenciar Pastas de Culturas Anuais
                                </Button>
                            )}
                        </VStack>
                    </>
                )}

            </VStack>

            <Flex justify="flex-end" gap={3} mt={6}>
                <Button onClick={onClose} variant="outline" colorPalette="red">
                    {canEditMasterData ? "Cancelar" : "Fechar"}
                </Button>
                
                {/* O botão de Salvar os DADOS DO TALHÃO só aparece para Proprietário e Gerente */}
                {canEditMasterData && (
                    <Button onClick={handleSubmit} colorPalette="green" loading={isSubmitting}>Salvar</Button>
                )}
            </Flex>
        </DialogContainer>
    );
}
