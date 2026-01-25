import { useState } from "react";
import { Button, Heading, Text, VStack, Grid, Box, Separator, useDisclosure, Flex } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";

import DialogContainer from "@/components/Property/DialogContainer";
import AnalysisListDialog from "@/components/Plot/AnalysisListDialog";

// Interfaces
import { PlotResponse } from "@/interfaces/Plot";
import { SoilAnalysisResponse } from "@/interfaces/SoilAnalysis";
import { TipoExtrato } from "@/interfaces/SoilAnalysis";
import { Camada } from "@/interfaces/LayerExtract";

// Modais de Visualização
import { PhysicalAnalysisFormDialog } from "@/components/PlotAnalysis/PhysicalAnalysisFormDialog";
import { FertilityAnalysisFormDialog } from "@/components/PlotAnalysis/FertilityAnalysisFormDialog";
import { SaturationExtractAnalysisFormDialog } from "@/components/PlotAnalysis/SaturationExtractAnalysisFormDialog";

// Serviços
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

type AnalysisType = "PHYSICAL" | "CHEMICAL" | "SATURATION" | null;

export default function PlotDetailsDialog({ isOpen, onClose, plot }: Props) {
    const [activeListType, setActiveListType] = useState<AnalysisType>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    
    const physicalDisclosure = useDisclosure();
    const fertilityDisclosure = useDisclosure();
    const saturationDisclosure = useDisclosure();
    
    const [selectedAnalysisData, setSelectedAnalysisData] = useState<any>(null);

    if (!plot) return null;

    const handleOpenList = (type: AnalysisType) => setActiveListType(type);
    const handleCloseList = () => setActiveListType(null);

    // Carrega dados completos da análise para exibição no formulário
    const handleSelectAnalysis = async (analysis: SoilAnalysisResponse) => {
        setIsLoadingDetails(true);
        try {
            const isLayer = analysis.tipo_extrato === TipoExtrato.CAMADAS;
            
            // 1. Buscar Containers
            let containers: any[] = [];
            if (isLayer) {
                containers = await layerExtractService.getByAnalysisId(analysis.id);
            } else {
                containers = await rangeExtractService.getByAnalysisId(analysis.id);
            }

            // 2. Buscar Dados Científicos
            const extractsData = await Promise.all(containers.map(async (container) => {
                const containerId = container.id;
                let scientificData: any = null;

                if (activeListType === "PHYSICAL") {
                    const res = isLayer 
                        ? await physicalAnalysisExtractService.getByLayerExtractId(containerId)
                        : await physicalAnalysisExtractService.getByRangeExtractId(containerId);
                    scientificData = res[0];
                } 
                else if (activeListType === "CHEMICAL") {
                    const res = isLayer
                        ? await fertilityAnalysisExtractService.getByLayerExtractId(containerId)
                        : await fertilityAnalysisExtractService.getByRangeExtractId(containerId);
                    scientificData = res[0];
                }
                else if (activeListType === "SATURATION") {
                    const res = isLayer
                        ? await saturationExtractAnalysisExtractService.getByLayerExtractId(containerId)
                        : await saturationExtractAnalysisExtractService.getByRangeExtractId(containerId);
                    scientificData = res[0];
                }

                if (!scientificData) return null;

                const baseData = {
                    tempId: Math.random().toString(36).substr(2, 9),
                    databaseId: scientificData.id, 
                    containerId: container.id,
                    profundidadeInicial: container.profundidade_inicial,
                    profundidadeFinal: container.profundidade_final,
                    camada: isLayer ? (container.camada as Camada) : undefined,
                    subcamada: isLayer ? container.sub_layer : undefined,
                };

                // Mapeamento condicional (usando spread para simplificar, mas mantendo a lógica de mapeamento)
                if (activeListType === "PHYSICAL") {
                     return {
                        ...baseData,
                        teorAreia: scientificData.teor_areia,
                        teorSilte: scientificData.teor_silte,
                        teorArgila: scientificData.teor_argila,
                        densidadeAparente: scientificData.densidade_aparente,
                        densidadeReal: scientificData.densidade_real,
                        porosidadeTotal: scientificData.porosidade_total,
                        microporosidade: scientificData.microporosidade,
                        umidadeCapacidadeCampo: scientificData.umidade_capacidade_campo,
                        umidadePontoMurchaPermanente: scientificData.umidade_ponto_murcha_permanente,
                        aguaDisponivel: scientificData.agua_disponivel,
                        resistenciaPenetracao: scientificData.resistencia_penetracao,
                        percAgregados6_0mm: scientificData.perc_agregados_6_0mm,
                        percAgregados4_1a6_0mm: scientificData.perc_agregados_4_1_a_6_0mm,
                        percAgregados2_1a4_0mm: scientificData.perc_agregados_2_1_a_4_0mm,
                        percAgregados1_0a2_0mm: scientificData.perc_agregados_1_0_a_2_0mm,
                        percAgregados0_5a1_0mm: scientificData.perc_agregados_0_5_a_1_0mm,
                        percAgregados0_25a0_5mm: scientificData.perc_agregados_0_25_a_0_5mm,
                        percAgregadosMenor0_25mm: scientificData.perc_agregados_menor_1_0mm,
                        dmAgregados: scientificData.dm_agregados || 0
                    };
                }
                if (activeListType === "CHEMICAL") {
                    return {
                        ...baseData,
                        phAgua: scientificData.ph_agua,
                        phCacl2: scientificData.ph_cacl2,
                        calcio: scientificData.calcio,
                        magnesio: scientificData.magnesio,
                        potassio: scientificData.potassio,
                        sodio: scientificData.sodio,
                        aluminio: scientificData.aluminio,
                        aluminioMaisHidrogenio: scientificData.aluminio_mais_hidrogenio,
                        somaBases: scientificData.soma_bases,
                        ctcEfetiva: scientificData.ctc_efetiva,
                        ctcPh7: scientificData.ctc_ph_7,
                        saturacaoBasesV: scientificData.saturacao_bases_v,
                        saturacaoAluminioM: scientificData.saturacao_aluminio_m,
                        fosforoMehlich1: scientificData.fosforo_mehlich1,
                        fosforoResina: scientificData.fosforo_resina,
                        enxofre: scientificData.enxofre,
                        materiaOrganica: scientificData.materia_organica,
                        boro: scientificData.boro,
                        cobre: scientificData.cobre,
                        ferro: scientificData.ferro,
                        manganes: scientificData.manganes,
                        molibdenio: scientificData.molibdenio,
                        zinco: scientificData.zinco
                    };
                }
                if (activeListType === "SATURATION") {
                    return {
                        ...baseData,
                        ph: scientificData.ph,
                        ce: scientificData.ce,
                        teorCO3: scientificData.teor_co3,
                        teorHCO3: scientificData.teor_hco3,
                        teorNO3: scientificData.teor_no3,
                        teorH2PO4: scientificData.teor_h2po4,
                        teorSO4: scientificData.teor_so4,
                        teorNa: scientificData.teor_na,
                        teorK: scientificData.teor_k,
                        teorCa: scientificData.teor_ca,
                        teorMg: scientificData.teor_mg,
                        residuosSuspensao: scientificData.residuos_suspensao,
                        durezaCaCO3: scientificData.dureza_caco3,
                        durezaTotalCaCO3: scientificData.dureza_total_caco3,
                        ras: scientificData.ras,
                        pst: scientificData.pst
                    };
                }

                return null;
            }));

            const validExtracts = extractsData.filter(item => item !== null);

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
            <DialogContainer isOpen={isOpen} onClose={onClose}>
                <Heading as="h2" size="md" mb={6} color="green.600">Detalhes do Talhão: {plot.identificacao}</Heading>
                <VStack align="stretch" gap={4}>
                    <Grid templateColumns="1fr 1fr" gap={4}><DetailItem label="Área" value={`${plot.area} ha`} /><DetailItem label="Ano Safra" value={plot.ano_incorporacao_safra} /></Grid>
                    <Grid templateColumns="1fr 1fr" gap={4}><DetailItem label="Classe Solo" value={plot.classe_solo} /><DetailItem label="Textura Solo" value={plot.textura_solo} /></Grid>
                    <Grid templateColumns="1fr 1fr" gap={4}><DetailItem label="Irrigada" value={plot.area_irrigada} /><DetailItem label="Declividade" value={`${plot.declividade}%`} /></Grid>
                    <Grid templateColumns="1fr 1fr" gap={4}><DetailItem label="Pluv. Mensal" value={`${plot.pluviosidade_mensal} mm`} /><DetailItem label="Pluv. Anual" value={`${plot.pluviosidade_anual} mm`} /></Grid>
                    <Separator my={2} borderColor="gray.300" />
                    <Text fontSize="sm" fontWeight="bold" color="gray.700">Visualizar Dados</Text>
                    <VStack gap={3} width="100%">
                        <Button variant="outline" width="100%" colorScheme="green" onClick={() => handleOpenList("PHYSICAL")} loading={isLoadingDetails && activeListType === "PHYSICAL"}>Análises Físicas</Button>
                        <Button variant="outline" width="100%" colorScheme="teal" onClick={() => handleOpenList("CHEMICAL")} loading={isLoadingDetails && activeListType === "CHEMICAL"}>Análises Químicas</Button>
                        <Button variant="outline" width="100%" colorScheme="purple" onClick={() => handleOpenList("SATURATION")} loading={isLoadingDetails && activeListType === "SATURATION"}>Análises de Extrato de Saturação</Button>
                        <Button variant="outline" width="100%" colorScheme="orange" disabled={true} _disabled={{ opacity: 0.6, cursor: "not-allowed" }} title="Em breve">Pastas de Culturas Anuais</Button>
                    </VStack>
                </VStack>
                <Flex justify="flex-end" mt={8}><Button onClick={onClose} colorScheme="blue">Fechar</Button></Flex>
            </DialogContainer>

            {/* Listas Filtradas Automaticamente */}
            {activeListType === "PHYSICAL" && <AnalysisListDialog isOpen={true} onClose={handleCloseList} title="Análises Físicas" plotId={plot.id} analysisType="PHYSICAL" onSelectAnalysis={handleSelectAnalysis} />}
            {activeListType === "CHEMICAL" && <AnalysisListDialog isOpen={true} onClose={handleCloseList} title="Análises Químicas" plotId={plot.id} analysisType="CHEMICAL" onSelectAnalysis={handleSelectAnalysis} />}
            {activeListType === "SATURATION" && <AnalysisListDialog isOpen={true} onClose={handleCloseList} title="Análises de Extrato de Saturação" plotId={plot.id} analysisType="SATURATION" onSelectAnalysis={handleSelectAnalysis} />}

            {/* Modais de Visualização (ReadOnly) */}
            <PhysicalAnalysisFormDialog isOpen={physicalDisclosure.open} onClose={physicalDisclosure.onClose} onSuccess={() => physicalDisclosure.onClose()} plotId={plot.id} plotIdentification={plot.identificacao} initialData={selectedAnalysisData} isReadOnly={true} />
            <FertilityAnalysisFormDialog isOpen={fertilityDisclosure.open} onClose={fertilityDisclosure.onClose} onSuccess={() => fertilityDisclosure.onClose()} plotId={plot.id} plotIdentification={plot.identificacao} initialData={selectedAnalysisData} isReadOnly={true} />
            <SaturationExtractAnalysisFormDialog isOpen={saturationDisclosure.open} onClose={saturationDisclosure.onClose} onSuccess={() => saturationDisclosure.onClose()} plotId={plot.id} plotIdentification={plot.identificacao} initialData={selectedAnalysisData} isReadOnly={true} />
        </>
    );
}