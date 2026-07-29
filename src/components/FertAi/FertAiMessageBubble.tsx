import { Box, Link, Text, VStack } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { FertAiMessage } from "@/interfaces/FertAi";

type Props = {
  message: FertAiMessage;
};

export default function FertAiMessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <Box
      alignSelf={isUser ? "flex-end" : "flex-start"}
      maxW={{ base: "95%", md: "82%" }}
      bg={isUser ? "blue.600" : { base: "gray.100", _dark: "gray.700" }}
      color={isUser ? "white" : "inherit"}
      borderRadius="lg"
      px={4}
      py={3}
      data-testid={`fert-ai-message-${message.role}`}
    >
      <Text fontSize="xs" fontWeight="bold" mb={1}>
        {isUser ? "Usuário" : "Fert-IA"}
      </Text>
      {isUser ? (
        <Text whiteSpace="pre-wrap">{message.content}</Text>
      ) : (
        <Box
          css={{
            "& p": { marginBottom: "0.65rem" },
            "& p:last-child": { marginBottom: 0 },
            "& ul, & ol": { paddingLeft: "1.25rem", marginBottom: "0.65rem" },
            "& table": { display: "block", overflowX: "auto", width: "100%" },
            "& th, & td": { borderWidth: "1px", padding: "0.35rem" },
            "& pre": { overflowX: "auto", padding: "0.65rem" },
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            skipHtml
            components={{
              a: ({ href, children }) => (
                <Link
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  textDecoration="underline"
                >
                  {children}
                </Link>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </Box>
      )}

      {!isUser && message.citations && message.citations.length > 0 && (
        <VStack align="stretch" gap={1} mt={3} aria-label="Fontes da resposta">
          <Text fontSize="xs" fontWeight="bold">Fontes</Text>
          {message.citations.map((citation, index) => (
            <Text key={`${citation.source}-${citation.page}-${index}`} fontSize="xs">
              [{citation.id ?? index + 1}] {citation.source ?? "Fonte sem nome"}
              {citation.page != null ? ` — p. ${citation.page}` : ""}
            </Text>
          ))}
        </VStack>
      )}
    </Box>
  );
}
