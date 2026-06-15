import { useState } from "react";
import { Button, Heading, Text, VStack, Grid, Box, Separator, useDisclosure, Flex } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";

import DialogContainer from "@/components/Property/DialogContainer";
import AnalysisListDialog from "@/components/Plot/AnalysisListDialog";
import { AnnualCropFolderListDialog } from "@/components/Plot/AnnualCropFolderListDialog";
import { AnnualCropFolderCropsDialog } from "@/components/Plot/AnnualCropFolderCropsDialog";
import { CropReadOnlyDialog } from "@/components/Crop/CropReadOnlyDialog";

import { PlotResponse } from "@/interfaces/Plot";
import { decimalToDms } from "@/components/Property/types";
import { SoilAnalysisResponse, TipoExtrato } from "@/interfaces/SoilAnalysis";
import { LayerExtractResponse } from "@/interfaces/LayerExtract";
import { RangeExtractResponse } from "@/interfaces/RangeExtract";
import { AnnualCropFolderResponseDto } from "@/interfaces/AnnualCropFolder";
import { CropResponseDto } from "@/interfaces/Crop";
import { PhysicalAnalysisExtractResponse } from "@/interfaces/PhysicalAnalysisExtract";
import { FertilityAnalysisExtractResponse } from "@/interfaces/FertilityAnalysisExtract";
import { SaturationExtractAnalysisExtractResponse } from "@/interfaces/SaturationExtractAnalysisExtract";
import { PhysicalExtractFormData } from "@/interfaces/PhysicalAnalysisFormTypes";
import { FertilityExtractFormData } from "@/interfaces/FertilityAnalysisFormTypes";
import { SaturationExtractFormData } from "@/interfaces/SaturationExtractAnalysisFormTypes";

import { PhysicalAnalysisFormDialog } from "@/components/PlotAnalysis/PhysicalAnalysisFormDialog";
import { FertilityAnalysisFormDialog } from "@/components/PlotAnalysis/FertilityAnalysisFormDialog";
import { SaturationExtractAnalysisFormDialog } from "@/components/PlotAnalysis/SaturationExtractAnalysisFormDialog";

import { layerExtractService } from "@/services/layerExtractService";
import { rangeExtractService } from "@/services/rangeExtractService";
import { physicalAnalysisExtractService } from "@/services/physicalAnalysisExtractService";
import { fertilityAnalysisExtractService } from "@/services/fertilityAnalysisExtractService";
import { saturationExtractAnalysisExtractService } from "@/services/saturationExtractAnalysisExtractService";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    plot: PlotResponse | null;
};

const DetailItem = ({ label, value }: { label: string, value: string | number }) => (
    <Box>
        <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">{label}</Text>
        <Text fontSize="md" color="gray.700" _dark={{ color: "gray.200" }}>{value}</Text>
    </Box>
);


const FALLBACK_VALUE = "-";

const formatBasicValue = (value?: string | number | null, suffix = "") => {
    if (value === undefined || value === null || value === "") return FALLBACK_VALUE;
    return `${value}${suffix}`;
};

const formatCoordinate = (value?: number | null, direction?: string) => {
    if (value === undefined || value === null) return FALLBACK_VALUE;

    const normalizedDirection = direction
        ? direction.toLowerCase()
            .replace(/_/g, " ")
            .trim()
        : "";

    const directionMap: Record<string, string> = {
        n: "Norte",
        norte: "Norte",
        s: "Sul",
        sul: "Sul",
        e: "Leste",
        l: "Leste",
        leste: "Leste",
        w: "Oeste",
        o: "Oeste",
        oeste: "Oeste",
    };

    const localizedDirection = directionMap[normalizedDirection];
    const coordinate = decimalToDms(value);
    const formattedValue = `${coordinate.degrees}° ${coordinate.minutes}' ${coordinate.seconds}"`;
    return localizedDirection ? `${formattedValue} ${localizedDirection}` : formattedValue;
};

type AnalysisType = "PHYSICAL" | "CHEMICAL" | "SATURATION" | null;
type ExtractContainer = LayerExtractResponse | RangeExtractResponse;

const getContainerBaseData = (scientificData: { id: number }, container: ExtractContainer, isLayer: boolean) => ({
    tempId: scientificData.id.toString(),
    databaseId: scientificData.id,
    containerId: container.id,
    profundidadeInicial: container.profundidade_inicial,
    profundidadeFinal: container.profundidade_final,
    camada: isLayer ? (container as LayerExtractResponse).camada : undefined,
    subcamada: isLayer ? (container as LayerExtractResponse).subcamada : undefined,
});

const mapPhysicalToFormData = (
    data: PhysicalAnalysisExtractResponse,
    container: ExtractContainer,
    isLayer: boolean,
): PhysicalExtractFormData => ({
    ...getContainerBaseData(data, container, isLayer),
    teorAreia: data.teor_areia,
    teorSilte: data.teor_silte,
    teorArgila: data.teor_argila,
    densidadeAparente: data.densidade_aparente,
    densidadeReal: data.densidade_real,
    porosidadeTotal: data.porosidade_total,
    microporosidade: data.microporosidade,
    umidadeCapacidadeCampo: data.umidade_capacidade_campo,
    umidadePontoMurchaPermanente: data.umidade_ponto_murcha_permanente,
    aguaDisponivel: data.agua_disponivel,
    resistenciaPenetracao: data.resistencia_penetracao,
    percAgregados6_0mm: data.perc_agregados_6_0mm,
    percAgregados4_1a6_0mm: data.perc_agregados_4_1_a_6_0mm,
    percAgregados2_1a4_0mm: data.perc_agregados_2_1_a_4_0mm,
    percAgregados1_0a2_0mm: data.perc_agregados_1_0_a_2_0mm ?? 0,
    percAgregados0_5a1_0mm: data.perc_agregados_0_5_a_1_0mm ?? 0,
    percAgregados0_25a0_5mm: data.perc_agregados_0_25_a_0_5mm ?? 0,
    percAgregadosMenor0_25mm: data.perc_agregados_menor_0_25mm ?? 0,
    dmAgregados: data.dm_agregados ?? 0,
});

const mapFertilityToFormData = (
    data: FertilityAnalysisExtractResponse,
    container: ExtractContainer,
    isLayer: boolean,
): FertilityExtractFormData => ({
    ...getContainerBaseData(data, container, isLayer),
    phAgua: data.ph_agua,
    phCacl2: data.ph_cacl2,
    calcio: data.calcio,
    magnesio: data.magnesio,
    potassio: data.potassio,
    sodio: data.sodio,
    aluminio: data.aluminio,
    aluminioMaisHidrogenio: data.aluminio_mais_hidrogenio,
    somaBases: data.soma_bases,
    ctcEfetiva: data.ctc_efetiva,
    ctcPh7: data.ctc_ph7,
    saturacaoBasesV: data.saturacao_bases_v,
    saturacaoAluminioM: data.saturacao_aluminio_m,
    pst: data.pst ?? 0,
    fosforoMehlich1: data.fosforo_mehlich1,
    fosforoResina: data.fosforo_resina,
    enxofre: data.enxofre,
    materiaOrganica: data.materia_organica,
    boro: data.boro,
    cobre: data.cobre,
    ferro: data.ferro,
    manganes: data.manganes,
    zinco: data.zinco,
});

const mapSaturationToFormData = (
    data: SaturationExtractAnalysisExtractResponse,
    container: ExtractContainer,
    isLayer: boolean,
): SaturationExtractFormData => ({
    ...getContainerBaseData(data, container, isLayer),
    ph: data.ph,
    ce: data.ce,
    teorCO3: data.teor_co3,
    teorHCO3: data.teor_hco3,
    teorNO3: data.teor_no3,
    teorH2PO4: data.teor_h2po4,
    teorSO4: data.teor_so4,
    teorCl: data.teor_cl ?? 0,
    teorNa: data.teor_na,
    teorK: data.teor_k,
    teorCa: data.teor_ca,
    teorMg: data.teor_mg,
    residuosSuspensao: data.residuos_suspensao,
    durezaCaCO3: data.dureza_caco3,
    durezaTotalCaCO3: data.dureza_total_caco3,
    ras: data.ras,
});

export default function PlotDetailsDialog({ isOpen, onClose, plot }: Props) {
    const [activeListType, setActiveListType] = useState<AnalysisType>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isAnnualCropFoldersOpen, setIsAnnualCropFoldersOpen] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<AnnualCropFolderResponseDto | null>(null);
    const [isCropsOpen, setIsCropsOpen] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState<CropResponseDto | null>(null);
    const [isCropDetailsOpen, setIsCropDetailsOpen] = useState(false);
    
    const physicalDisclosure = useDisclosure();
    const fertilityDisclosure = useDisclosure();
    const saturationDisclosure = useDisclosure();
    
    const [selectedAnalysisData, setSelectedAnalysisData] = useState<any>(null);

    if (!plot) return null;

    const handleOpenList = (type: AnalysisType) => setActiveListType(type);
    const handleCloseList = () => setActiveListType(null);
    const handleOpenAnnualCropFolders = () => setIsAnnualCropFoldersOpen(true);
    const handleCloseAnnualCropFolders = () => setIsAnnualCropFoldersOpen(false);
    const handleSelectFolder = (folder: AnnualCropFolderResponseDto) => {
        setSelectedFolder(folder);
        setIsCropsOpen(true);
    };
    const handleCloseCrops = () => setIsCropsOpen(false);
    const handleSelectCrop = (crop: CropResponseDto) => {
        setSelectedCrop(crop);
        setIsCropDetailsOpen(true);
    };
    const handleCloseCropDetails = () => setIsCropDetailsOpen(false);

    const handleSelectAnalysis = async (analysis: SoilAnalysisResponse) => {
        setIsLoadingDetails(true);
        try {
            const isLayer = analysis.tipo_extrato === TipoExtrato.CAMADAS;
            
            let containers: any[] = [];
            if (isLayer) {
                containers = await layerExtractService.getByAnalysisId(analysis.id);
            } else {
                containers = await rangeExtractService.getByAnalysisId(analysis.id);
            }

            const extractsData = await Promise.all(containers.map(async (container: ExtractContainer) => {
                const containerId = container.id;
                let scientificData: any = null;

                if (activeListType === "PHYSICAL") {
                    const res = isLayer 
                        ? await physicalAnalysisExtractService.getByLayerExtractId(containerId)
                        : await physicalAnalysisExtractService.getByRangeExtractId(containerId);
                    scientificData = res[0];
                    return scientificData ? mapPhysicalToFormData(scientificData, container, isLayer) : null;
                } 
                else if (activeListType === "CHEMICAL") {
                    const res = isLayer
                        ? await fertilityAnalysisExtractService.getByLayerExtractId(containerId)
                        : await fertilityAnalysisExtractService.getByRangeExtractId(containerId);
                    scientificData = res[0];
                    return scientificData ? mapFertilityToFormData(scientificData, container, isLayer) : null;
                }
                else if (activeListType === "SATURATION") {
                    const res = isLayer
                        ? await saturationExtractAnalysisExtractService.getByLayerExtractId(containerId)
                        : await saturationExtractAnalysisExtractService.getByRangeExtractId(containerId);
                    scientificData = res[0];
                    return scientificData ? mapSaturationToFormData(scientificData, container, isLayer) : null;
                }

                return null;
            }));

            const validExtracts = extractsData.filter(item => item !== null);
            validExtracts.sort((a, b) => a.profundidadeInicial - b.profundidadeInicial);

            const formData = {
                analysisId: analysis.id,
                year: analysis.ano_analise,
                lab: analysis.laboratorio_responsavel,
                type: analysis.tipo_extrato,
                extracts: validExtracts
            };

            setSelectedAnalysisData(formData);

            if (activeListType === "PHYSICAL") physicalDisclosure.onOpen();
            else if (activeListType === "CHEMICAL") fertilityDisclosure.onOpen();
            else if (activeListType === "SATURATION") saturationDisclosure.onOpen();

        } catch (error) {
            console.error(error);
            toaster.create({ title: "Erro ao carregar dados", type: "error" });
        } finally {
            setIsLoadingDetails(false);
        }
    };

    return (
        <>
            <DialogContainer isOpen={isOpen} onClose={onClose} expandable>
                <Heading as="h2" size="md" mb={6} color="green.600">Detalhes do Talhão: {plot.identificacao}</Heading>
                <VStack align="stretch" gap={4}>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}><DetailItem label="Área" value={formatBasicValue(plot.area, " ha")} /><DetailItem label="Ano Safra" value={formatBasicValue(plot.ano_incorporacao_safra)} /></Grid>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}><DetailItem label="Classe Solo" value={formatBasicValue(plot.classe_solo)} /><DetailItem label="Textura Solo" value={formatBasicValue(plot.textura_solo)} /></Grid>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}><DetailItem label="Irrigada" value={formatBasicValue(plot.area_irrigada)} /><DetailItem label="Declividade" value={formatBasicValue(plot.declividade, "%")} /></Grid>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}><DetailItem label="Pluv. Mensal" value={formatBasicValue(plot.pluviosidade_mensal, " mm")} /><DetailItem label="Pluv. Anual" value={formatBasicValue(plot.pluviosidade_anual, " mm")} /></Grid>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}><DetailItem label="Latitude" value={formatCoordinate(plot.latitude, plot.latitude_direction ?? plot.latitudeDirection)} /><DetailItem label="Longitude" value={formatCoordinate(plot.longitude, plot.longitude_direction ?? plot.longitudeDirection)} /></Grid>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}><DetailItem label="Altitude" value={formatBasicValue(plot.altitude, " m")} /><Box /></Grid>
                    <Separator my={2} borderColor="gray.300" />
                    <Text fontSize="sm" fontWeight="bold" color="gray.700">Visualizar Dados</Text>
                    <VStack gap={3} width="100%">
                        <Button variant="outline" width="100%" colorScheme="green" onClick={() => handleOpenList("PHYSICAL")} loading={isLoadingDetails && activeListType === "PHYSICAL"}>Análises Físicas</Button>
                        <Button variant="outline" width="100%" colorScheme="teal" onClick={() => handleOpenList("CHEMICAL")} loading={isLoadingDetails && activeListType === "CHEMICAL"}>Análises Químicas</Button>
                        <Button variant="outline" width="100%" colorScheme="purple" onClick={() => handleOpenList("SATURATION")} loading={isLoadingDetails && activeListType === "SATURATION"}>Análises de Extrato de Saturação</Button>
                        
                        {/* Todos os usuários podem VISUALIZAR as pastas de culturas */}
                        <Button variant="outline" width="100%" colorScheme="orange" onClick={handleOpenAnnualCropFolders}>Pastas de Culturas Anuais</Button>
                    </VStack>
                </VStack>
                <Flex justify="flex-end" mt={8}><Button onClick={onClose} colorScheme="blue">Fechar</Button></Flex>
            </DialogContainer>

            {activeListType === "PHYSICAL" && <AnalysisListDialog isOpen={true} onClose={handleCloseList} title="Análises Físicas" plotId={plot.id} analysisType="PHYSICAL" onSelectAnalysis={handleSelectAnalysis} />}
            {activeListType === "CHEMICAL" && <AnalysisListDialog isOpen={true} onClose={handleCloseList} title="Análises Químicas" plotId={plot.id} analysisType="CHEMICAL" onSelectAnalysis={handleSelectAnalysis} />}
            {activeListType === "SATURATION" && <AnalysisListDialog isOpen={true} onClose={handleCloseList} title="Análises de Extrato de Saturação" plotId={plot.id} analysisType="SATURATION" onSelectAnalysis={handleSelectAnalysis} />}

            <AnnualCropFolderListDialog isOpen={isAnnualCropFoldersOpen} onClose={handleCloseAnnualCropFolders} plotId={plot.id} onSelectFolder={handleSelectFolder} />
            <AnnualCropFolderCropsDialog isOpen={isCropsOpen} onClose={handleCloseCrops} folder={selectedFolder} onSelectCrop={handleSelectCrop} />
            <CropReadOnlyDialog isOpen={isCropDetailsOpen} onClose={handleCloseCropDetails} crop={selectedCrop} />

            <PhysicalAnalysisFormDialog isOpen={physicalDisclosure.open} onClose={physicalDisclosure.onClose} onSuccess={() => physicalDisclosure.onClose()} plotId={plot.id} plotIdentification={plot.identificacao} initialData={selectedAnalysisData} isReadOnly={true} />
            <FertilityAnalysisFormDialog isOpen={fertilityDisclosure.open} onClose={fertilityDisclosure.onClose} onSuccess={() => fertilityDisclosure.onClose()} plotId={plot.id} plotIdentification={plot.identificacao} initialData={selectedAnalysisData} isReadOnly={true} />
            <SaturationExtractAnalysisFormDialog isOpen={saturationDisclosure.open} onClose={saturationDisclosure.onClose} onSuccess={() => saturationDisclosure.onClose()} plotId={plot.id} plotIdentification={plot.identificacao} initialData={selectedAnalysisData} isReadOnly={true} />
        </>
    );
}
