import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";

import type {
  FertAiMessage,
  FertAiRecommendationContext,
} from "@/interfaces/FertAi";
import {
  getRecommendation,
} from "@/services/recommendationService";
import {
  FertAiRequestError,
  sendFertAiMessage,
} from "@/services/fertAiService";
import {
  getRecommendationReportText,
  type RecommendationResponse,
} from "@/interfaces/Recommendation";
import FertAiMessageBubble from "./FertAiMessageBubble";

type Props = {
  recommendations: RecommendationResponse[];
  loadingRecommendations: boolean;
  recommendationsError?: string | null;
};

const newSessionId = () => crypto.randomUUID();

const recommendationName = (recommendation: RecommendationResponse) =>
  recommendation.nome_pasta_recomendacao
  ?? recommendation.nomePastaRecomendacao
  ?? `Recomendação ${recommendation.id}`;

const buildContext = (
  recommendation: RecommendationResponse,
): FertAiRecommendationContext => ({
  recommendation_id: recommendation.id,
  general_report: getRecommendationReportText(recommendation),
  crop: recommendation.cultura ?? null,
  property: recommendation.nome_propriedade ?? recommendation.nomePropriedade ?? null,
  plot: recommendation.identificacao_talhao ?? recommendation.identificacaoTalhao ?? null,
  year: recommendation.ano_safra ?? recommendation.anoSafra ?? null,
});

export default function FertAiPanel({
  recommendations,
  loadingRecommendations,
  recommendationsError,
}: Props) {
  const [sessionId, setSessionId] = useState(newSessionId);
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<number | null>(null);
  const [pendingContext, setPendingContext] = useState<FertAiRecommendationContext | null>(null);
  const [messages, setMessages] = useState<FertAiMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loadingContext, setLoadingContext] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedQuestion, setLastFailedQuestion] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);

  const selectedRecommendation = useMemo(
    () => recommendations.find((item) => item.id === selectedRecommendationId) ?? null,
    [recommendations, selectedRecommendationId],
  );

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, sending]);

  useEffect(
    () => () => abortControllerRef.current?.abort(),
    [],
  );

  const resetConversation = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setSessionId(newSessionId());
    setMessages([]);
    setPendingContext(null);
    setQuestion("");
    setErrorMessage(null);
    setLastFailedQuestion(null);
    setSending(false);
  };

  const handleSelectRecommendation = async (recommendation: RecommendationResponse) => {
    if (sending || loadingContext) return;

    resetConversation();
    setSelectedRecommendationId(recommendation.id);
    setLoadingContext(true);
    try {
      const completeRecommendation = await getRecommendation(recommendation.id);
      const context = buildContext(completeRecommendation);
      if (!context.general_report.trim()) {
        throw new Error("Recomendação Geral ausente.");
      }
      setPendingContext(context);
    } catch {
      setSelectedRecommendationId(null);
      setErrorMessage("Não foi possível carregar a Recomendação Geral selecionada.");
    } finally {
      setLoadingContext(false);
    }
  };

  const handleFreeChat = () => {
    if (sending || loadingContext) return;
    resetConversation();
    setSelectedRecommendationId(null);
  };

  const sendQuestion = async (value: string, preserveExistingUserMessage = false) => {
    const normalizedQuestion = value.trim();
    if (!normalizedQuestion || sending || loadingContext) return;

    const userMessage: FertAiMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: normalizedQuestion,
    };
    if (!preserveExistingUserMessage) {
      setMessages((current) => [...current, userMessage]);
    }
    setQuestion("");
    setSending(true);
    setErrorMessage(null);
    setLastFailedQuestion(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      const response = await sendFertAiMessage(
        {
          session_id: sessionId,
          question: normalizedQuestion,
          recommendation_context: pendingContext,
        },
        controller.signal,
      );
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.answer,
          citations: response.citations,
        },
      ]);
      setPendingContext(null);
    } catch (error) {
      const message = error instanceof FertAiRequestError
        ? error.message
        : "O Fert-IA está temporariamente indisponível. Tente novamente.";
      if (!(error instanceof FertAiRequestError && error.code === "ABORTED")) {
        setErrorMessage(message);
        setLastFailedQuestion(normalizedQuestion);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setSending(false);
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={{ base: 4, md: 6 }} mt={6}>
      <Heading size="lg">Fert-IA</Heading>
      <Text color="fg.muted" mt={1} mb={5}>
        Assistente inteligente para interpretar recomendações agronômicas e esclarecer dúvidas.
      </Text>

      <VStack
        align="stretch"
        gap={3}
        minH="260px"
        maxH="520px"
        overflowY="auto"
        borderWidth="1px"
        borderRadius="md"
        p={4}
        aria-live="polite"
        aria-label="Conversa com o Fert-IA"
      >
        {messages.length === 0 && (
          <Text color="fg.muted">
            Faça uma pergunta livre ou selecione uma recomendação para receber uma interpretação contextual.
          </Text>
        )}
        {messages.map((message) => (
          <FertAiMessageBubble key={message.id} message={message} />
        ))}
        {sending && (
          <Flex align="center" gap={2}>
            <Spinner size="sm" />
            <Text>Pensando...</Text>
          </Flex>
        )}
        <div ref={conversationEndRef} />
      </VStack>

      {errorMessage && (
        <Box mt={3} role="alert">
          <Text color="red.500">{errorMessage}</Text>
          {lastFailedQuestion && (
            <Button
              size="sm"
              mt={2}
              onClick={() => void sendQuestion(lastFailedQuestion, true)}
              disabled={sending}
            >
              Tentar novamente
            </Button>
          )}
        </Box>
      )}

      <Flex mt={4} gap={3} align="flex-end" direction={{ base: "column", md: "row" }}>
        <Textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void sendQuestion(question);
            }
          }}
          placeholder="Faça uma pergunta sobre sua recomendação..."
          aria-label="Pergunta para o Fert-IA"
          disabled={sending || loadingContext}
          resize="vertical"
        />
        {sending ? (
          <Button
            colorPalette="red"
            onClick={() => abortControllerRef.current?.abort()}
            w={{ base: "100%", md: "auto" }}
          >
            Cancelar
          </Button>
        ) : (
          <Button
            colorPalette="blue"
            onClick={() => void sendQuestion(question)}
            disabled={!question.trim() || loadingContext}
            w={{ base: "100%", md: "auto" }}
          >
            Enviar
          </Button>
        )}
      </Flex>

      <Box mt={6}>
        <Heading size="sm" mb={3}>Escolha uma recomendação para interpretar</Heading>
        <Button
          size="sm"
          variant={selectedRecommendationId === null ? "solid" : "outline"}
          onClick={handleFreeChat}
          disabled={sending || loadingContext}
          mb={3}
        >
          Pergunta livre, sem recomendação
        </Button>

        {loadingRecommendations ? (
          <Flex align="center" gap={2}><Spinner size="sm" /><Text>Carregando recomendações...</Text></Flex>
        ) : recommendationsError ? (
          <Text color="orange.500">{recommendationsError}</Text>
        ) : recommendations.length === 0 ? (
          <Text color="fg.muted">Nenhuma recomendação encontrada.</Text>
        ) : (
          <VStack align="stretch" gap={2}>
            {recommendations.map((recommendation) => {
              const selected = selectedRecommendationId === recommendation.id;
              return (
                <Button
                  key={recommendation.id}
                  variant={selected ? "solid" : "outline"}
                  colorPalette={selected ? "green" : "gray"}
                  h="auto"
                  py={3}
                  whiteSpace="normal"
                  justifyContent="flex-start"
                  textAlign="left"
                  aria-pressed={selected}
                  disabled={sending || loadingContext}
                  loading={loadingContext && selected}
                  onClick={() => void handleSelectRecommendation(recommendation)}
                >
                  <Box>
                    <Text fontWeight="bold">{recommendationName(recommendation)}</Text>
                    <Text fontSize="sm">
                      {recommendation.nome_propriedade ?? "-"} • {recommendation.identificacao_talhao ?? "-"}
                      {" • "}{recommendation.cultura ?? "-"} • {recommendation.ano_safra ?? "-"}
                    </Text>
                  </Box>
                </Button>
              );
            })}
          </VStack>
        )}
        {selectedRecommendation && pendingContext && (
          <Text mt={3} fontSize="sm" color="green.500">
            Recomendação selecionada: {recommendationName(selectedRecommendation)}
          </Text>
        )}
      </Box>
    </Box>
  );
}
