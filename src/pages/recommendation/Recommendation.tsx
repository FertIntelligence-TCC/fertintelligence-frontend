import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Input,
  Separator,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  chakra,
} from "@chakra-ui/react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";

import UserLayout from "@/components/Layouts/UserLayout";
import FertName from "@/components/FertName/FertName";
import ConfigMenu from "@/components/ConfigMenu/ConfigMenu";
import { toaster } from "@/components/ui/toaster";
import { Cargo } from "@/interfaces/User";
import type { PlotResponse } from "@/interfaces/Plot";
import type { PropertyResponse } from "@/interfaces/Property";
import {
  type RecommendationCropName,
  type RecommendationLimingCriteria,
  type RecommendationFertilizerOrigin,
  type RecommendationResponse,
  type RecommendationType,
  getRecommendationReportText,
} from "@/interfaces/Recommendation";
import { getPlotsByProperty } from "@/services/plotService";
import { fetchMyProperties } from "@/services/propertyService";
import { propertyAccessRequestService } from "@/services/propertyAccessRequestService";
import {
  fetchCropFertilizationTables,
  fetchPublicCropFertilizationTables,
} from "@/services/cropFertilizationTableService";
import {
  fetchPublicSoilFertilityTables,
  fetchSoilFertilityTables,
} from "@/services/soilFertilityInterpretationCriteriaTableService";
import { fetchFoliarTables, fetchPublicFoliarTables } from "@/services/foliarAnalysisInterpretationTableService";
import {
  deleteRecommendation,
  generateRecommendation,
  getMyRecommendations,
  preparePrintRecommendation,
  improveRecommendationNarrative,
} from "@/services/recommendationService";
import { useUserStore } from "@/stores/user/user.store";
import { LuArrowLeft } from "react-icons/lu";
import RecommendationReportViewer, {
  parseRecommendationReportBlocks,
} from "@/components/Recommendation/RecommendationReportViewer";

const NativeSelect = chakra("select", {
  base: {
    borderWidth: "1px",
    borderRadius: "md",
    px: 3,
    h: 10,
    width: "100%",
    bg: "bg.panel",
  },
});

type TableOption = {
  id: number;
  label: string;
  source: "PRIVATE" | "PUBLIC" | "UNKNOWN";
};

type RawTable = {
  id?: number;
  nome?: string;
  name?: string;
  nome_tabela?: string;
  nome_criterios?: string;
  nome_comum_cultura?: string;
  region?: string;
  regiao?: string;
  tabela_publica?: boolean;
  public?: boolean;
};

const recommendationTypeOptions: { value: RecommendationType; label: string }[] = [
  { value: "ACIDITY_OR_SALINITY_CORRECTION", label: "Correção de acidez/salinidade" },
  { value: "FERTILIZATION", label: "Adubação" },
  { value: "BOTH", label: "Ambos" },
];

const cropOptions: RecommendationCropName[] = ["ALGODAO", "AMENDOIM", "CANA_DE_ACUCAR", "FEIJAO_CAUPI", "FEIJAO_COMUM", "GERGELIM", "MAMONA", "MILHO", "SISAL", "SOJA"];

const fertilizerOriginOptions: { value: RecommendationFertilizerOrigin; label: string }[] = [
  { value: "PRIVATE", label: "Adubos privados" },
  { value: "PUBLIC", label: "Adubos públicos" },
  { value: "BOTH", label: "Ambos" },
];

const limingCriteriaOptions: RecommendationLimingCriteria[] = [
  "SATURACAO_POR_BASES_TROCAVEIS",
  "NEUTRALIZACAO_POR_ALUMINIO_TROCAVEL",
  "ELEVACAO_DO_TEOR_DE_CALCIO_MAIS_MAGNESIO",
  "NEUTRALIZACAO_POR_ALUMINIO_TROCAVEL_MAIS_ELEVACAO_DO_TEOR_DE_CALCIO_MAIS_MAGNESIO",
];

const canPrintRecommendation = (cargo?: string) =>
  cargo === "AGRONOMO_RESIDENTE" || cargo === "AGRONOMO_CONSULTOR";

const normalizeLimingCriteria = (criteria?: string | null): RecommendationLimingCriteria | undefined => {
  if (!criteria) return undefined;
  if (criteria === "PORCENTAGEM_DE_SATURACAO_DAS_BASES") return "SATURACAO_POR_BASES_TROCAVEIS";
  return criteria as RecommendationLimingCriteria;
};

const normalizeTable = (table: RawTable, fallbackSource: TableOption["source"]): TableOption | null => {
  if (!table?.id) return null;
  const source = table.tabela_publica === true || table.public === true ? "PUBLIC" : fallbackSource;
  const cropName = table.nome_comum_cultura ? ` • ${table.nome_comum_cultura}` : "";
  const region = table.regiao ?? table.region;
  const regionText = region ? ` (${region})` : "";
  const baseName = table.nome ?? table.name ?? table.nome_tabela ?? table.nome_criterios ?? `Tabela ${table.id}`;
  return { id: table.id, label: `${baseName}${cropName}${regionText}`, source };
};

const writePrintableReport = (printWindow: Window, text: string) => {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const blocks = parseRecommendationReportBlocks(text);
  const contentHtml = blocks
    .map((block) => {
      if (block.type === "spacing") {
        return "<div class=\"spacing\"></div>";
      }

      if (block.type === "heading") {
        return `<h2>${escapeHtml(block.content)}</h2>`;
      }

      if (block.type === "table") {
        const [headerRow, ...bodyRows] = block.rows;
        const headerHtml = headerRow
          ? `<thead><tr>${headerRow.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr></thead>`
          : "";
        const bodyHtml = `<tbody>${bodyRows
          .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
          .join("")}</tbody>`;
        return `<table>${headerHtml}${bodyHtml}</table>`;
      }

      return `<p>${escapeHtml(block.content)}</p>`;
    })
    .join("");

  const doc = printWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Laudo Técnico</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; line-height: 1.6; color: #000; font-size: 14px; }
      h1 { margin: 0 0 24px; font-size: 26px; }
      h2 { margin: 20px 0 8px; font-size: 18px; }
      p { margin: 0; white-space: pre-wrap; }
      .spacing { height: 12px; }
      table { width: 100%; border-collapse: collapse; margin: 10px 0; }
      th, td { border: 1px solid #000; padding: 8px 10px; text-align: left; vertical-align: top; }
      th { font-weight: 700; background: #f2f2f2; }
      .footer { margin-top: 36px; }
    </style>
  </head>
  <body>
    <h1>Laudo Técnico de Recomendação Agrícola</h1>
    <div>${contentHtml}</div>
    <div class="footer">Documento emitido pelo sistema FertIntelligence.</div>
  </body>
</html>`);
  doc.close();
};

export default function Recommendation() {
  const user = useUserStore((s) => s.user);
  const navigate = useNavigate();
  const userCanPrint = canPrintRecommendation(user?.cargo);


  const [recommendationType, setRecommendationType] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedPlotId, setSelectedPlotId] = useState("");
  const [cropYear, setCropYear] = useState("");
  const [cropName, setCropName] = useState("");
  const [cropFertilizationTableId, setCropFertilizationTableId] = useState("");
  const [soilFertilityInterpretationTableId, setSoilFertilityInterpretationTableId] = useState("");
  const [cropFoliarAnalysisInterpretationTableId, setCropFoliarAnalysisInterpretationTableId] = useState("");
  const [limingCriteria, setLimingCriteria] = useState("");
  const [fertilizerOrigin, setFertilizerOrigin] = useState<RecommendationFertilizerOrigin>("BOTH");

  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [plots, setPlots] = useState<PlotResponse[]>([]);
  const [cropFertilizationTables, setCropFertilizationTables] = useState<TableOption[]>([]);
  const [soilFertilityTables, setSoilFertilityTables] = useState<TableOption[]>([]);
  const [foliarInterpretationTables, setFoliarInterpretationTables] = useState<TableOption[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationResponse | null>(null);
  const [recommendationsHistory, setRecommendationsHistory] = useState<RecommendationResponse[]>([]);

  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingPlots, setLoadingPlots] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [printing, setPrinting] = useState(false);
  const [improvingNarrative, setImprovingNarrative] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const selectedProperty = useMemo(() => properties.find((p) => String(p.id) === selectedPropertyId), [properties, selectedPropertyId]);
  const selectedPlot = useMemo(() => plots.find((p) => String(p.id) === selectedPlotId), [plots, selectedPlotId]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      setRecommendationsHistory(await getMyRecommendations());
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Falha ao carregar histórico.", type: "error" });
    } finally { setLoadingHistory(false); }
  };

  useEffect(() => {
    const loadProperties = async () => {
      setLoadingProperties(true);
      try {
        const data = user?.cargo === Cargo.PROPRIETARIO ? await fetchMyProperties() : await propertyAccessRequestService.getMyApprovedProperties();
        setProperties(data ?? []);
      } catch (error) {
        console.error(error);
        setProperties([]);
        toaster.create({ title: "Falha ao carregar propriedades.", type: "error" });
      } finally { setLoadingProperties(false); }
    };

    const loadTables = async () => {
      setLoadingTables(true);
      try {
        const [cropPrivate, cropPublic, soilPrivate, soilPublic, foliarPrivate, foliarPublic] = await Promise.all([
          fetchCropFertilizationTables(), fetchPublicCropFertilizationTables(), fetchSoilFertilityTables(), fetchPublicSoilFertilityTables(), fetchFoliarTables(), fetchPublicFoliarTables(),
        ]);
        setCropFertilizationTables([...(cropPrivate ?? []).map((t) => normalizeTable(t, "PRIVATE")), ...(cropPublic ?? []).map((t) => normalizeTable(t, "PUBLIC"))].filter(Boolean) as TableOption[]);
        setSoilFertilityTables([...(soilPrivate ?? []).map((t) => normalizeTable(t, "PRIVATE")), ...(soilPublic ?? []).map((t) => normalizeTable(t, "PUBLIC"))].filter(Boolean) as TableOption[]);
        setFoliarInterpretationTables([...(foliarPrivate ?? []).map((t) => normalizeTable(t, "PRIVATE")), ...(foliarPublic ?? []).map((t) => normalizeTable(t, "PUBLIC"))].filter(Boolean) as TableOption[]);
      } catch (error) {
        console.error(error);
        toaster.create({ title: "Falha ao carregar tabelas.", type: "error" });
      } finally { setLoadingTables(false); }
    };

    void Promise.all([loadProperties(), loadTables(), loadHistory()]);
  }, [user?.cargo]);

  useEffect(() => {
    const loadPlots = async () => {
      if (!selectedPropertyId) {
        setPlots([]);
        setSelectedPlotId("");
        return;
      }
      setLoadingPlots(true);
      setSelectedPlotId("");
      setPlots([]);
      try {
        setPlots(await getPlotsByProperty(Number(selectedPropertyId)));
      } catch (error) {
        console.error(error);
        toaster.create({ title: "Falha ao carregar talhões.", type: "error" });
      } finally { setLoadingPlots(false); }
    };

    void loadPlots();
  }, [selectedPropertyId]);

  const handleGenerate = async () => {
    const year = Number(cropYear);
    if (!recommendationType || !selectedPropertyId || !selectedPlotId || !cropYear || Number.isNaN(year) || year <= 1900 || !cropName || !cropFertilizationTableId || !soilFertilityInterpretationTableId || !cropFoliarAnalysisInterpretationTableId || !limingCriteria || !fertilizerOrigin) {
      toaster.create({ title: "Campos obrigatórios", description: "Preencha todos os campos necessários antes de gerar a recomendação.", type: "warning" });
      return;
    }

    setGenerating(true);
    try {
      const result = await generateRecommendation({
        tipo_recomendacao: recommendationType as RecommendationType,
        id_propriedade: Number(selectedPropertyId),
        id_talhao: Number(selectedPlotId),
        ano_safra: year,
        cultura: cropName as RecommendationCropName,
        id_tabela_adubacao_cultura: Number(cropFertilizationTableId),
        id_tabela_interpretacao_fertilidade_solo: Number(soilFertilityInterpretationTableId),
        id_tabela_interpretacao_analise_foliar: Number(cropFoliarAnalysisInterpretationTableId),
        criterio_calagem: limingCriteria as RecommendationLimingCriteria,
        origem_adubos: fertilizerOrigin,
      });
      setSelectedRecommendation(result);
      toaster.create({ title: "Recomendação gerada com sucesso.", type: "success" });
      await loadHistory();
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Falha ao gerar recomendação.", type: "error" });
    } finally { setGenerating(false); }
  };

  const handleImproveNarrative = async () => {
    if (!selectedRecommendation?.id) {
      toaster.create({
        title: "Laudo indisponível",
        description: "Nenhum laudo foi encontrado para melhorar.",
        type: "warning",
      });
      return;
    }

    try {
      setImprovingNarrative(true);
      const improvedRecommendation = await improveRecommendationNarrative(selectedRecommendation.id);
      setSelectedRecommendation(improvedRecommendation);
      toaster.create({ title: "Texto do laudo melhorado com sucesso.", type: "success" });
      await loadHistory();
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Falha ao melhorar texto do laudo.", type: "error" });
    } finally {
      setImprovingNarrative(false);
    }
  };

  const handlePrintRecommendation = async () => {
    if (!selectedRecommendation?.id) {
      toaster.create({
        title: "Laudo indisponível",
        description: "Nenhum laudo foi encontrado para impressão.",
        type: "warning",
      });
      return;
    }

    try {
      setPrinting(true);
      const printableRecommendation = await preparePrintRecommendation(selectedRecommendation.id);
      const printableReportText = getRecommendationReportText(printableRecommendation);

      if (!printableReportText?.trim()) {
        toaster.create({
          title: "Laudo indisponível",
          description: "Nenhum laudo foi encontrado para impressão.",
          type: "warning",
        });
        return;
      }

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toaster.create({
          title: "Erro ao imprimir",
          description: "Não foi possível abrir a janela de impressão.",
          type: "error",
        });
        return;
      }

      writePrintableReport(printWindow, printableReportText);
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError && error.response?.status === 403) {
        toaster.create({
          title: "Acesso negado",
          description: "Seu usuário não possui permissão para emitir laudos formais.",
          type: "error",
        });
        return;
      }
      toaster.create({
        title: "Erro ao imprimir",
        description: "Não foi possível preparar o laudo para impressão.",
        type: "error",
      });
    } finally {
      setPrinting(false);
    }
  };

  const reportText = getRecommendationReportText(selectedRecommendation);

  return (
    <UserLayout><FertName subtitle="Módulo de recomendações" /><ConfigMenu />
      <Box px={4} py={8} maxW="1200px" mx="auto">
        <Button variant="outline" mb={4} onClick={() => navigate("/fertintelligence/home")}>
          <LuArrowLeft /> Voltar para o painel
        </Button>
        <VStack align="start" gap={3} mb={6}><Heading size="xl">Gerar Recomendação</Heading><Text color="fg.muted">Gere recomendações técnicas preliminares para correção e adubação.</Text></VStack>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <Box borderWidth="1px" borderRadius="lg" p={6}><Heading size="md" mb={3}>Formulário técnico</Heading><Separator mb={4} />
            <VStack align="stretch" gap={3}>
              <NativeSelect value={recommendationType} onChange={(e) => setRecommendationType(e.target.value)}><option value="">Tipo de recomendação</option>{recommendationTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</NativeSelect>
              <NativeSelect value={fertilizerOrigin} onChange={(e) => setFertilizerOrigin(e.target.value as RecommendationFertilizerOrigin)}><option value="">Que adubos usar?</option>{fertilizerOriginOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</NativeSelect>
              <NativeSelect value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)} disabled={loadingProperties}>{loadingProperties ? <option>Carregando...</option> : <><option value="">Propriedade</option>{properties.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</>}</NativeSelect>
              <NativeSelect value={selectedPlotId} onChange={(e) => setSelectedPlotId(e.target.value)} disabled={!selectedPropertyId || loadingPlots}>{loadingPlots ? <option>Carregando...</option> : <><option value="">Talhão</option>{plots.map((p) => <option key={p.id} value={p.id}>{p.identificacao ?? `Talhão ${p.id}`}</option>)}</>}</NativeSelect>
              <Input placeholder="Ano da safra" value={cropYear} onChange={(e) => setCropYear(e.target.value)} />
              <NativeSelect value={cropName} onChange={(e) => setCropName(e.target.value)}><option value="">Cultura</option>{cropOptions.map((crop) => <option key={crop} value={crop}>{crop}</option>)}</NativeSelect>
              <NativeSelect value={cropFertilizationTableId} onChange={(e) => setCropFertilizationTableId(e.target.value)} disabled={loadingTables || cropFertilizationTables.length === 0}><option value="">{cropFertilizationTables.length ? "Tabela de adubação de culturas" : "Nenhuma tabela encontrada"}</option>{cropFertilizationTables.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</NativeSelect>
              <NativeSelect value={soilFertilityInterpretationTableId} onChange={(e) => setSoilFertilityInterpretationTableId(e.target.value)} disabled={loadingTables || soilFertilityTables.length === 0}><option value="">{soilFertilityTables.length ? "Tabela de interpretação da fertilidade do solo" : "Nenhuma tabela encontrada"}</option>{soilFertilityTables.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</NativeSelect>
              <NativeSelect value={cropFoliarAnalysisInterpretationTableId} onChange={(e) => setCropFoliarAnalysisInterpretationTableId(e.target.value)} disabled={loadingTables || foliarInterpretationTables.length === 0}><option value="">{foliarInterpretationTables.length ? "Tabela de interpretação de análise foliar" : "Nenhuma tabela encontrada"}</option>{foliarInterpretationTables.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</NativeSelect>
              <NativeSelect value={limingCriteria} onChange={(e) => setLimingCriteria(e.target.value)}><option value="">Critério de calagem</option>{limingCriteriaOptions.map((c) => <option key={c} value={c}>{c}</option>)}</NativeSelect>
              <Button colorPalette="blue" onClick={handleGenerate} loading={generating}>Gerar Recomendação</Button>
            </VStack>
          </Box>
          <Box borderWidth="1px" borderRadius="lg" p={6}><Flex justify="space-between" align="center" mb={3} gap={2}><Heading size="md">Resultado da Recomendação</Heading>{selectedRecommendation ? <Button size="xs" variant="ghost" onClick={() => setIsFullscreenOpen(true)}>Tela cheia</Button> : null}</Flex><Separator mb={4} />
            {selectedRecommendation ? (<VStack align="stretch" gap={4}><Flex justify="space-between" align={{ base: "start", md: "center" }} gap={3} wrap="wrap"><Badge colorPalette={userCanPrint ? "green" : "orange"}>{userCanPrint ? "Laudo imprimível" : "Simulação"}</Badge><HStack gap={2}><Button variant="outline" onClick={async () => { if (!reportText) { toaster.create({ title: "Nenhum laudo para copiar.", type: "warning" }); return; } try { await navigator.clipboard.writeText(reportText); toaster.create({ title: "Laudo copiado para a área de transferência.", type: "success" }); } catch (error) { console.error(error); toaster.create({ title: "Falha ao copiar laudo.", type: "error" }); } }}>Copiar Laudo</Button><Button variant="subtle" loading={improvingNarrative} onClick={handleImproveNarrative}>{improvingNarrative ? "Melhorando..." : "Melhorar Texto do Laudo"}</Button>{userCanPrint && selectedRecommendation.printable !== false ? <Button colorPalette="blue" loading={printing} onClick={handlePrintRecommendation}>Imprimir Laudo</Button> : null}</HStack></Flex><Flex gap={2} wrap="wrap"><Badge>ID {selectedRecommendation.id}</Badge><Badge>Propriedade {selectedRecommendation.nome_propriedade ?? selectedProperty?.nome ?? selectedRecommendation.id_propriedade ?? "-"}</Badge><Badge>Talhão {selectedRecommendation.identificacao_talhao ?? selectedPlot?.identificacao ?? selectedRecommendation.id_talhao ?? "-"}</Badge><Badge>Cultura {selectedRecommendation.cultura ?? "-"}</Badge><Badge>Ano {selectedRecommendation.ano_safra ?? "-"}</Badge><Badge>Tipo {selectedRecommendation.tipo_recomendacao ?? "-"}</Badge></Flex><Box fontSize="sm" borderWidth="1px" borderRadius="md" p={4} maxH="600px" overflowY="auto"><RecommendationReportViewer reportText={reportText} variant="compact" /></Box><Text fontSize="xs" color="fg.muted">A melhoria de texto não altera cálculos, doses ou recomendações técnicas.</Text>{!userCanPrint ? <Box borderWidth="1px" borderRadius="md" borderColor="orange.200" bg="orange.50" p={3} fontSize="sm">Esta recomendação foi gerada para fins de simulação. Apenas agrônomos residentes ou consultores podem emitir laudo formal para assinatura.</Box> : null}</VStack>) : <Text color="fg.muted">Nenhuma recomendação gerada ainda.</Text>}
          </Box>
        </SimpleGrid>

        <Box borderWidth="1px" borderRadius="lg" p={6} mt={4}><Heading size="md" mb={3}>Minhas Recomendações</Heading><Separator mb={4} />
          {loadingHistory ? <Spinner /> : recommendationsHistory.length === 0 ? <Text color="fg.muted">Nenhuma recomendação encontrada.</Text> : <VStack align="stretch" gap={3}>{recommendationsHistory.map((item) => (<Flex key={item.id} borderWidth="1px" borderRadius="md" p={3} justify="space-between" wrap="wrap" gap={3}><VStack align="start" gap={1}><Text fontWeight="bold">Recomendação #{item.id}</Text><Text fontSize="sm">Propriedade: {item.nome_propriedade ?? item.id_propriedade ?? "-"} • Talhão: {item.identificacao_talhao ?? item.id_talhao ?? "-"}</Text><Text fontSize="sm">Cultura: {item.cultura ?? "-"} • Ano: {item.ano_safra ?? "-"} • Tipo: {item.tipo_recomendacao ?? "-"} • Calagem: {normalizeLimingCriteria(item.criterio_calagem ?? item.criterioCalagem) ?? "-"}</Text></VStack><Flex gap={2}><Button size="sm" onClick={() => setSelectedRecommendation(item)}>Abrir</Button><Button size="sm" colorPalette="red" loading={deletingId === item.id} onClick={async () => { if (!window.confirm("Deseja excluir esta recomendação?")) return; setDeletingId(item.id); try { await deleteRecommendation(item.id); if (selectedRecommendation?.id === item.id) setSelectedRecommendation(null); toaster.create({ title: "Recomendação excluída com sucesso.", type: "success" }); await loadHistory(); } catch (error) { console.error(error); toaster.create({ title: "Falha ao excluir recomendação.", type: "error" }); } finally { setDeletingId(null); } }}>Excluir</Button></Flex></Flex>))}</VStack>}
        </Box>
      </Box>

      <DialogRoot
        open={isFullscreenOpen}
        onOpenChange={(event) => setIsFullscreenOpen(event.open)}
        size="cover"
        placement="center"
      >
        <DialogContent w="85vw" maxW="85vw" h="85vh">
          <DialogHeader>
            <DialogTitle>Resultado da Recomendação</DialogTitle>
          </DialogHeader>
          <DialogBody overflow="hidden" pb={4}>
            <Box
              fontSize="sm"
              borderWidth="1px"
              borderRadius="md"
              p={4}
              h="100%"
              overflowY="auto"
              overflowX="auto"
            >
              <RecommendationReportViewer reportText={reportText} variant="modal" />
            </Box>
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </UserLayout>
  );
}
