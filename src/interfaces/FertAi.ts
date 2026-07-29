export type FertAiRecommendationContext = {
  recommendation_id: number;
  general_report: string;
  crop?: string | null;
  property?: string | null;
  plot?: string | null;
  year?: number | null;
};

export type FertAiChatRequest = {
  session_id: string;
  question: string;
  recommendation_context?: FertAiRecommendationContext | null;
};

export type FertAiCitation = {
  id?: number | null;
  source?: string | null;
  page?: number | null;
  score?: number | null;
};

export type FertAiChatResponse = {
  session_id: string;
  answer: string;
  citations: FertAiCitation[];
};

export type FertAiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: FertAiCitation[];
};
