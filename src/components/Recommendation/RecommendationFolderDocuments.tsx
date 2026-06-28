import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Separator,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { IconType } from "react-icons";
import { LuFileText, LuFolder, LuListChecks, LuShoppingCart } from "react-icons/lu";

import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  DirectRecommendationResponse,
  RecommendationResponse,
  ShoppingListResponse,
} from "@/interfaces/Recommendation";

import RecommendationReportViewer from "./RecommendationReportViewer";
import RecommendationStructuredFertilizerTables, {
  hasStructuredRecommendationContent,
} from "./RecommendationStructuredFertilizerTables";

export type RecommendationDocumentKey = "general" | "summary" | "direct" | "shopping";
export type RecommendationDocumentStatus = "generated" | "not_generated" | "loading" | "error";

export type RecommendationDocumentView = {
  key: RecommendationDocumentKey;
  title: string;
  description: string;
  status: RecommendationDocumentStatus;
  content: string;
  icon: IconType;
};

type BuildRecommendationDocumentViewsParams = {
  reportText: string;
  loadedDocuments: Partial<Record<RecommendationDocumentKey, string>>;
  notGeneratedDocuments: Partial<Record<RecommendationDocumentKey, boolean>>;
  documentErrors: Partial<Record<RecommendationDocumentKey, string>>;
  loadingDocumentKey: RecommendationDocumentKey | null;
  structuredDocuments?: Partial<Record<RecommendationDocumentKey, boolean>>;
};

type RecommendationFolderDocumentsProps = {
  selectedRecommendation: RecommendationResponse | null;
  selectedDocument?: RecommendationDocumentView;
  selectedDocumentKey: RecommendationDocumentKey;
  recommendationDocuments: RecommendationDocumentView[];
  selectedDocumentError?: string;
  directRecommendationDocument?: DirectRecommendationResponse | null;
  shoppingListDocument?: ShoppingListResponse | null;
  loadingDocumentKey: RecommendationDocumentKey | null;
  userCanPrint: boolean;
  printing: boolean;
  improvingNarrative: boolean;
  isFullscreenOpen: boolean;
  propertyLabel: string | number;
  plotLabel: string | number;
  folderName: string;
  onSelectDocument: (document: RecommendationDocumentView) => void;
  onCopyDocument: () => void;
  onImproveNarrative: () => void;
  onPrintRecommendation: () => void;
  onFullscreenOpenChange: (open: boolean) => void;
};

const getDocumentStatusLabel = (status: RecommendationDocumentStatus) => {
  if (status === "generated") return "Gerado";
  if (status === "loading") return "Carregando";
  if (status === "error") return "Erro";
  return "Não gerado";
};

const getDocumentStatusColor = (status: RecommendationDocumentStatus) => {
  if (status === "generated") return "green";
  if (status === "loading") return "blue";
  if (status === "error") return "red";
  return "gray";
};

export function buildRecommendationDocumentViews({
  reportText,
  loadedDocuments,
  notGeneratedDocuments,
  documentErrors,
  loadingDocumentKey,
  structuredDocuments = {},
}: BuildRecommendationDocumentViewsParams): RecommendationDocumentView[] {
  const hasGeneralReport = Boolean(reportText?.trim());
  const summaryText = loadedDocuments.summary ?? "";
  const directText = loadedDocuments.direct ?? "";
  const shoppingText = loadedDocuments.shopping ?? "";
  const summaryNotGenerated = notGeneratedDocuments.summary === true;
  const directNotGenerated = notGeneratedDocuments.direct === true;
  const shoppingNotGenerated = notGeneratedDocuments.shopping === true;

  return [
    {
      key: "general",
      title: "Recomendação Geral",
      description: hasGeneralReport
        ? "Documento principal da pasta."
        : "Aguardando conteúdo retornado pelo backend.",
      status: loadingDocumentKey === "general"
        ? "loading"
        : documentErrors.general
          ? "error"
          : hasGeneralReport
            ? "generated"
            : "not_generated",
      content: reportText,
      icon: LuFileText,
    },
    {
      key: "summary",
      title: "Recomendação Resumida",
      description: summaryText.trim()
        ? "Documento da pasta carregado."
        : summaryNotGenerated
          ? "Documento ainda não gerado."
          : "Clique para carregar o documento.",
      status: loadingDocumentKey === "summary"
        ? "loading"
        : documentErrors.summary
          ? "error"
          : summaryText.trim()
            ? "generated"
            : "not_generated",
      content: summaryText,
      icon: LuListChecks,
    },
    {
      key: "direct",
      title: "Recomendação Direta",
      description: directText.trim() || structuredDocuments.direct
        ? "Documento da pasta carregado."
        : directNotGenerated
          ? "Documento ainda não gerado."
          : "Clique para carregar o documento.",
      status: loadingDocumentKey === "direct"
        ? "loading"
        : documentErrors.direct
          ? "error"
          : directText.trim() || structuredDocuments.direct
            ? "generated"
            : "not_generated",
      content: directText,
      icon: LuFileText,
    },
    {
      key: "shopping",
      title: "Lista de Compras",
      description: shoppingText.trim() || structuredDocuments.shopping
        ? "Documento da pasta carregado."
        : shoppingNotGenerated
          ? "Documento ainda não gerado."
          : "Clique para carregar o documento.",
      status: loadingDocumentKey === "shopping"
        ? "loading"
        : documentErrors.shopping
          ? "error"
          : shoppingText.trim() || structuredDocuments.shopping
            ? "generated"
            : "not_generated",
      content: shoppingText,
      icon: LuShoppingCart,
    },
  ];
}

function RecommendationDocumentCard({
  document,
  isSelected,
  loadingDocumentKey,
  onSelect,
}: {
  document: RecommendationDocumentView;
  isSelected: boolean;
  loadingDocumentKey: RecommendationDocumentKey | null;
  onSelect: () => void;
}) {
  const DocumentIcon = document.icon;

  return (
    <Box
      as="button"
      textAlign="left"
      borderWidth="1px"
      borderRadius="md"
      p={4}
      borderColor={isSelected ? "blue.400" : undefined}
      bg={isSelected ? "blue.50" : "bg.panel"}
      _dark={isSelected ? { bg: "blue.950", borderColor: "blue.400" } : undefined}
      aria-disabled={Boolean(loadingDocumentKey)}
      opacity={loadingDocumentKey && loadingDocumentKey !== document.key ? 0.65 : 1}
      cursor={loadingDocumentKey ? "not-allowed" : "pointer"}
      onClick={onSelect}
    >
      <Flex justify="space-between" align="start" gap={3}>
        <HStack align="start" gap={3}>
          <Box fontSize="xl" color={document.status === "generated" ? "green.600" : "fg.muted"}>
            {document.status === "loading" ? <Spinner size="sm" /> : <DocumentIcon />}
          </Box>
          <VStack align="start" gap={1}>
            <Text fontWeight="semibold">{document.title}</Text>
            <Text fontSize="xs" color="fg.muted">
              {document.description}
            </Text>
          </VStack>
        </HStack>
        <Badge colorPalette={getDocumentStatusColor(document.status)}>
          {getDocumentStatusLabel(document.status)}
        </Badge>
      </Flex>
    </Box>
  );
}

function RecommendationDocumentPanel({
  selectedDocument,
  selectedDocumentError,
  directRecommendationDocument,
  shoppingListDocument,
}: {
  selectedDocument?: RecommendationDocumentView;
  selectedDocumentError?: string;
  directRecommendationDocument?: DirectRecommendationResponse | null;
  shoppingListDocument?: ShoppingListResponse | null;
}) {
  const showDirectStructuredContent = selectedDocument?.key === "direct";
  const showShoppingStructuredContent =
    selectedDocument?.key === "shopping" &&
    hasStructuredRecommendationContent(shoppingListDocument);
  const shouldRenderTextContent =
    selectedDocument?.content.trim() && !(selectedDocument.key === "shopping" && showShoppingStructuredContent);

  return (
    <Box fontSize="sm" borderWidth="1px" borderRadius="md" p={4} maxH="600px" overflowY="auto">
      {selectedDocument?.status === "generated" ? (
        <VStack align="stretch" gap={4}>
          {shouldRenderTextContent ? (
            <RecommendationReportViewer reportText={selectedDocument.content} />
          ) : null}
          {showDirectStructuredContent ? (
            <RecommendationStructuredFertilizerTables document={directRecommendationDocument} />
          ) : null}
          {showShoppingStructuredContent ? (
            <RecommendationStructuredFertilizerTables document={shoppingListDocument} />
          ) : null}
        </VStack>
      ) : selectedDocument?.status === "loading" ? (
        <HStack gap={2}>
          <Spinner size="sm" />
          <Text color="fg.muted">Carregando documento...</Text>
        </HStack>
      ) : (
        <VStack align="start" gap={2}>
          <Text fontWeight="semibold">{selectedDocument?.title}</Text>
          <Text color="fg.muted">Documento ainda não gerado para esta pasta.</Text>
          {selectedDocumentError ? (
            <Text color="orange.600" fontSize="sm">
              {selectedDocumentError}
            </Text>
          ) : null}
        </VStack>
      )}
    </Box>
  );
}

export default function RecommendationFolderDocuments({
  selectedRecommendation,
  selectedDocument,
  selectedDocumentKey,
  recommendationDocuments,
  selectedDocumentError,
  directRecommendationDocument,
  shoppingListDocument,
  loadingDocumentKey,
  userCanPrint,
  printing,
  improvingNarrative,
  isFullscreenOpen,
  propertyLabel,
  plotLabel,
  folderName,
  onSelectDocument,
  onCopyDocument,
  onImproveNarrative,
  onPrintRecommendation,
  onFullscreenOpenChange,
}: RecommendationFolderDocumentsProps) {
  return (
    <>
      <Box borderWidth="1px" borderRadius="lg" p={6}>
        <Flex justify="space-between" align="center" mb={3} gap={2}>
          <Heading size="md">Pasta de Recomendações</Heading>
          {selectedRecommendation && selectedDocument?.status === "generated" ? (
            <Button size="xs" variant="ghost" onClick={() => onFullscreenOpenChange(true)}>
              Tela cheia
            </Button>
          ) : null}
        </Flex>
        <Separator mb={4} />
        {selectedRecommendation ? (
          <VStack align="stretch" gap={4}>
            <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={3} wrap="wrap">
              <HStack gap={2}>
                <LuFolder />
                <Heading size="sm">{folderName}</Heading>
                <Badge colorPalette={userCanPrint ? "green" : "orange"}>
                  {userCanPrint ? "Laudo imprimível" : "Laudo não imprimível"}
                </Badge>
              </HStack>
              <HStack gap={2} wrap="wrap">
                <Button variant="outline" disabled={selectedDocument?.status !== "generated"} onClick={onCopyDocument}>
                  Copiar Documento
                </Button>
                {selectedDocument?.key === "general" ? (
                  <Button variant="subtle" loading={improvingNarrative} onClick={onImproveNarrative}>
                    {improvingNarrative ? "Melhorando..." : "Melhorar Texto do Laudo"}
                  </Button>
                ) : null}
                {userCanPrint && selectedRecommendation.printable !== false && selectedDocument?.key === "general" ? (
                  <Button colorPalette="blue" loading={printing} onClick={onPrintRecommendation}>
                    Imprimir Laudo
                  </Button>
                ) : null}
              </HStack>
            </Flex>
            <Flex gap={2} wrap="wrap">
              <Badge>ID {selectedRecommendation.id}</Badge>
              <Badge>Propriedade {propertyLabel}</Badge>
              <Badge>Talhão {plotLabel}</Badge>
              <Badge>Cultura {selectedRecommendation.cultura ?? "-"}</Badge>
              <Badge>Ano {selectedRecommendation.ano_safra ?? "-"}</Badge>
              <Badge>Tipo {selectedRecommendation.tipo_recomendacao ?? "-"}</Badge>
            </Flex>
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
              {recommendationDocuments.map((document) => (
                <RecommendationDocumentCard
                  key={document.key}
                  document={document}
                  isSelected={selectedDocumentKey === document.key}
                  loadingDocumentKey={loadingDocumentKey}
                  onSelect={() => onSelectDocument(document)}
                />
              ))}
            </SimpleGrid>
            <RecommendationDocumentPanel
              selectedDocument={selectedDocument}
              selectedDocumentError={selectedDocumentError}
              directRecommendationDocument={directRecommendationDocument}
              shoppingListDocument={shoppingListDocument}
            />
            <Text fontSize="xs" color="fg.muted">
              A Recomendação Geral usa o laudo técnico legado quando o backend retorna technicalReport, laudo_tecnico ou laudoTecnico. Os demais documentos são carregados dos endpoints próprios e não são montados no frontend.
            </Text>
            <Text fontSize="xs" color="fg.muted">
              A melhoria de texto não altera cálculos, doses ou recomendações técnicas.
            </Text>
            {!userCanPrint ? (
              <Box borderWidth="1px" borderRadius="md" borderColor="orange.200" bg="orange.50" p={3} fontSize="sm">
                Apenas agrônomos residentes ou consultores podem emitir laudo formal para assinatura.
              </Box>
            ) : null}
          </VStack>
        ) : (
          <Text color="fg.muted">Nenhuma recomendação gerada ainda.</Text>
        )}
      </Box>

      <DialogRoot
        open={isFullscreenOpen}
        onOpenChange={(event) => onFullscreenOpenChange(event.open)}
        size="cover"
        placement="center"
      >
        <DialogContent w="85vw" maxW="85vw" h="85vh">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title ?? "Documento da recomendação"}</DialogTitle>
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
              {selectedDocument?.status === "generated" ? (
                <VStack align="stretch" gap={4}>
                  {selectedDocument.content.trim() &&
                  !(selectedDocument.key === "shopping" &&
                    hasStructuredRecommendationContent(shoppingListDocument)) ? (
                    <RecommendationReportViewer reportText={selectedDocument.content} />
                  ) : null}
                  {selectedDocument.key === "direct" ? (
                    <RecommendationStructuredFertilizerTables document={directRecommendationDocument} />
                  ) : null}
                  {selectedDocument.key === "shopping" &&
                  hasStructuredRecommendationContent(shoppingListDocument) ? (
                    <RecommendationStructuredFertilizerTables document={shoppingListDocument} />
                  ) : null}
                </VStack>
              ) : (
                <Text color="fg.muted">Documento ainda não gerado para esta pasta.</Text>
              )}
            </Box>
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </>
  );
}
