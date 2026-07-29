import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import GreenFertilizerFormFields from "./FormFields/GreenFertilizerFormFields";
import OrganicFertilizerFormFields from "./FormFields/OrganicFertilizerFormFields";
import OrganoMineralFertilizerFormFields from "./FormFields/OrganoMineralFertilizerFormFields";
import {
  DEFAULT_GREEN_FERTILIZER_FORM_STATE,
  DEFAULT_ORGANIC_FERTILIZER_FORM_STATE,
  DEFAULT_ORGANO_MINERAL_FORM_STATE,
} from "@/interfaces/Fertilizer";
import {
  mapGreenFormToCreatePayload,
  mapGreenFormToUpdatePayload,
  mapGreenResponseToForm,
} from "@/pages/fertilizer/GreenFertilizer";
import {
  mapOrganicFormToCreatePayload,
  mapOrganicResponseToForm,
} from "@/pages/fertilizer/OrganicFertilizer";
import {
  mapOrganoMineralFormToCreatePayload,
  mapOrganoMineralResponseToForm,
} from "@/pages/fertilizer/OrganoMineralFertilizer";

const renderForm = (component: React.ReactNode) =>
  render(<ChakraProvider value={defaultSystem}>{component}</ChakraProvider>);

afterEach(cleanup);

describe("cadastros estendidos de fertilizantes", () => {
  it("posiciona umidade verde entre nome e carbono e mantém a relação C/N independente", () => {
    renderForm(
      <GreenFertilizerFormFields
        form={{ ...DEFAULT_GREEN_FERTILIZER_FORM_STATE, c: "18,0", n: "3,0", umidadeIncorporacao: "72,5" }}
        onChange={() => undefined}
      />,
    );

    const name = screen.getByText("Nome do Adubo *");
    const moisture = screen.getByText("Umidade (%) na incorporação");
    const carbon = screen.getByText("Carbono (%) *");
    expect(name.compareDocumentPosition(moisture) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(moisture.compareDocumentPosition(carbon) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText("6.00")).toBeInTheDocument();
    expect(screen.getByText("4° ano (%)")).toBeInTheDocument();
  });

  it("preserva vazio, zero e vírgula decimal nos payloads novos do adubo verde", () => {
    const empty = mapGreenFormToCreatePayload(DEFAULT_GREEN_FERTILIZER_FORM_STATE);
    expect(empty.umidade_incorporacao_percentual).toBeNull();
    expect(empty.taxa_mineralizacao_quarto_ano_percentual).toBeNull();

    const filled = { ...DEFAULT_GREEN_FERTILIZER_FORM_STATE, umidadeIncorporacao: "0", taxaMineralizacaoAno4: "12,75" };
    expect(mapGreenFormToCreatePayload(filled).umidade_incorporacao_percentual).toBe(0);
    expect(mapGreenFormToUpdatePayload(filled).novo_taxa_mineralizacao_quarto_ano_percentual).toBe(12.75);
    expect(mapGreenResponseToForm({ nome_adubo: "Antigo" } as never).umidadeIncorporacao).toBe("");
  });

  it("renderiza composição física, quatro anos e metais pesados na ordem solicitada", () => {
    renderForm(
      <OrganicFertilizerFormFields
        form={DEFAULT_ORGANIC_FERTILIZER_FORM_STATE}
        onChange={() => undefined}
      />,
    );

    expect(screen.getByText("Composição Física")).toBeInTheDocument();
    expect(screen.getByText("Taxa de Mineralização")).toBeInTheDocument();
    expect(screen.getByText("Micronutrientes (%)")).toBeInTheDocument();
    expect(screen.getByText("Metais Pesados (mg/kg)")).toBeInTheDocument();
    expect(screen.getByText("Valor do frete até a fazenda (R$/t)")).toBeInTheDocument();
    for (const label of ["Arsênio", "Cádmio", "Crômio", "Chumbo", "Mercúrio", "Níquel", "Selênio"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("mantém metais vazios nulos e zero explícito no payload orgânico", () => {
    const empty = mapOrganicFormToCreatePayload(DEFAULT_ORGANIC_FERTILIZER_FORM_STATE);
    expect(empty.taxa_mineralizacao_quarto_ano_percentual).toBeNull();
    expect(empty.taxa_mineralizacao_primeiro_ano_percentual).toBeNull();
    expect(empty.valor_frete_tonelada).toBeNull();
    expect(empty.arsenio_mg_kg).toBeNull();
    expect(empty.selenio_mg_kg).toBeNull();

    const filled = {
      ...DEFAULT_ORGANIC_FERTILIZER_FORM_STATE,
      taxaMineralizacaoAno4: "8,5",
      arsenio: "0",
      cadmio: "0,125",
      taxaMineralizacaoAno1: "42,5",
      valorFreteTonelada: "0",
    };
    const payload = mapOrganicFormToCreatePayload(filled);
    expect(payload.taxa_mineralizacao_quarto_ano_percentual).toBe(8.5);
    expect(payload.arsenio_mg_kg).toBe(0);
    expect(payload.cadmio_mg_kg).toBe(0.125);
    expect(payload.taxa_mineralizacao_primeiro_ano_percentual).toBe(42.5);
    expect(payload.valor_frete_tonelada).toBe(0);
    expect(mapOrganicResponseToForm({ nome_adubo: "Antigo" } as never).arsenio).toBe("");
  });

  it("renderiza e transporta os quatro anos do organomineral sem remover campos anteriores", () => {
    renderForm(
      <OrganoMineralFertilizerFormFields
        form={DEFAULT_ORGANO_MINERAL_FORM_STATE}
        onChange={() => undefined}
      />,
    );
    expect(screen.getByText("Taxa de Mineralização (%)")).toBeInTheDocument();
    expect(screen.getByText("1° ano (%)")).toBeInTheDocument();
    expect(screen.getByText("4° ano (%)")).toBeInTheDocument();
    expect(screen.getByText("Índices Físico-Químicos")).toBeInTheDocument();

    const form = {
      ...DEFAULT_ORGANO_MINERAL_FORM_STATE,
      taxaMineralizacaoAno1: "40,5",
      taxaMineralizacaoAno2: "25",
      taxaMineralizacaoAno3: "10,25",
      taxaMineralizacaoAno4: "0",
    };
    const payload = mapOrganoMineralFormToCreatePayload(form);
    expect(payload.taxa_mineralizacao_primeiro_ano_percentual).toBe(40.5);
    expect(payload.taxa_mineralizacao_segundo_ano_percentual).toBe(25);
    expect(payload.taxa_mineralizacao_terceiro_ano_percentual).toBe(10.25);
    expect(payload.taxa_mineralizacao_quarto_ano_percentual).toBe(0);
    expect(mapOrganoMineralResponseToForm({ nome_adubo: "Antigo" } as never).taxaMineralizacaoAno4).toBe("");
  });
});
