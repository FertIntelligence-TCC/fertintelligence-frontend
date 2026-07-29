import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { RecommendationResponse } from "@/interfaces/Recommendation";
import RecommendationReportHeader from "./RecommendationReportHeader";

const renderHeader = (recommendation: RecommendationResponse) =>
  render(
    <ChakraProvider value={defaultSystem}>
      <RecommendationReportHeader recommendation={recommendation} documentKey="general" />
    </ChakraProvider>,
  );

afterEach(cleanup);

describe("cabeçalho do relatório na visualização", () => {
  it("renderiza a logo e os dados reais do snapshot", () => {
    renderHeader({
      id: 1,
      tipo_recomendacao: "FERTILIZATION",
      responsavel_tecnico_relatorio: "Gilvan e Miguel",
      telefone_responsavel_relatorio: "55 83 991214231",
      email_responsavel_relatorio: "profissional@exemplo.com",
    });

    expect(screen.getByRole("img", { name: "FertIntelligence" })).toHaveAttribute(
      "src",
      expect.stringContaining("fertintelligence-logo.svg"),
    );
    expect(screen.getAllByText(/Gilvan e Miguel/).length).toBeGreaterThan(0);
    expect(screen.getByText(/55 83 991214231/)).toBeInTheDocument();
    expect(screen.getByText(/profissional@exemplo.com/)).toBeInTheDocument();
    expect(screen.getByRole("heading")).toHaveTextContent(
      "RELATÓRIO GERAL DA RECOMENDAÇÃO DE ADUBAÇÃO",
    );
  });

  it("não cria labels nem valores artificiais para snapshot ausente", () => {
    renderHeader({ id: 2 } as RecommendationResponse);

    expect(screen.queryByText("Telefone/WhatsApp:")).not.toBeInTheDocument();
    expect(screen.queryByText("E-mail:")).not.toBeInTheDocument();
    expect(screen.queryByText(/Não informado/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/CEO/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Endereço/i)).not.toBeInTheDocument();
  });
});
