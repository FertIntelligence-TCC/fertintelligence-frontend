import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CorrectiveP2O5FertilizationModal from "./CorrectiveP2O5FertilizationModal";
import CorrectiveK2OFertilizationModal from "./CorrectiveK2OFertilizationModal";
import * as p2o5Service from "@/services/correctiveP2O5FertilizationService";
import * as k2oService from "@/services/correctiveK2OFertilizationService";

vi.mock("@/services/correctiveP2O5FertilizationService");
vi.mock("@/services/correctiveK2OFertilizationService");
vi.mock("@/components/ui/toaster", () => ({ toaster: { create: vi.fn() } }));

const p2o5Rows = [1, 2, 3].map((id) => ({
  id,
  id_tabela: 10,
  argila_minima: id * 10,
  argila_maxima: id * 10 + 9,
  p_mehlich_minimo: id,
  p_mehlich_maximo: id + 1,
  dose_p2o5: id * 20,
  observacoes: `P ${id}`,
  fontes: `Fonte P ${id}`
}));

const k2oRows = [11, 12, 13].map((id, index) => ({
  id,
  id_tabela: 10,
  ctc_minima: index * 10,
  ctc_maxima: index * 10 + 9,
  k_minimo: index,
  k_maximo: index + 1,
  dose_k2o: (index + 1) * 20,
  observacoes: `K ${id}`,
  fontes: `Fonte K ${id}`
}));

const renderModal = (component: React.ReactNode) =>
  render(<ChakraProvider value={defaultSystem}>{component}</ChakraProvider>);

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(p2o5Service.getCorrectiveP2O5FertilizationByTable).mockResolvedValue(p2o5Rows);
  vi.mocked(p2o5Service.deleteCorrectiveP2O5Fertilization).mockResolvedValue(undefined);
  vi.mocked(p2o5Service.updateCorrectiveP2O5Fertilization).mockResolvedValue(undefined);
  vi.mocked(p2o5Service.createCorrectiveP2O5Fertilization).mockResolvedValue(undefined);
  vi.mocked(k2oService.getCorrectiveK2OFertilizationByTable).mockResolvedValue(k2oRows);
  vi.mocked(k2oService.deleteCorrectiveK2OFertilization).mockResolvedValue(undefined);
  vi.mocked(k2oService.updateCorrectiveK2OFertilization).mockResolvedValue(undefined);
  vi.mocked(k2oService.createCorrectiveK2OFertilization).mockResolvedValue(undefined);
});

describe.each([
  {
    name: "P₂O₅",
    title: "Adubação Corretiva de P₂O₅",
    render: () => renderModal(<CorrectiveP2O5FertilizationModal isOpen onClose={vi.fn()} tableId={10} />),
    removedIds: [3, 2, 1],
    deleteRow: p2o5Service.deleteCorrectiveP2O5Fertilization,
    createRow: p2o5Service.createCorrectiveP2O5Fertilization
  },
  {
    name: "K₂O",
    title: "Adubação Corretiva de K₂O",
    render: () => renderModal(<CorrectiveK2OFertilizationModal isOpen onClose={vi.fn()} tableId={10} />),
    removedIds: [13, 12, 11],
    deleteRow: k2oService.deleteCorrectiveK2OFertilization,
    createRow: k2oService.createCorrectiveK2OFertilization
  }
])("modal $name", ({ title, render: renderSubject, removedIds, deleteRow, createRow }) => {
  it("exibe o título químico e remove repetidamente somente a última linha", async () => {
    const user = userEvent.setup();
    renderSubject();

    expect(await screen.findByText(title)).toBeInTheDocument();
    expect(screen.getByText("Linha 3")).toBeInTheDocument();

    const removeButton = screen.getByRole("button", { name: "Remover última linha" });
    await user.click(removeButton);
    expect(screen.queryByText("Linha 3")).not.toBeInTheDocument();
    expect(screen.getByText("Linha 2")).toBeInTheDocument();

    await user.click(removeButton);
    expect(screen.queryByText("Linha 2")).not.toBeInTheDocument();
    await user.click(removeButton);
    expect(screen.queryByText("Linha 1")).not.toBeInTheDocument();
    expect(removeButton).toBeDisabled();
  });

  it("adiciona e remove uma linha nova sem persistir exclusão", async () => {
    const user = userEvent.setup();
    renderSubject();
    await screen.findByText("Linha 3");

    await user.click(screen.getByRole("button", { name: "Adicionar linha" }));
    expect(screen.getByText("Linha 4")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remover última linha" }));
    expect(screen.queryByText("Linha 4")).not.toBeInTheDocument();
    expect(deleteRow).not.toHaveBeenCalled();
    expect(createRow).not.toHaveBeenCalled();
  });

  it("exclui no salvamento os IDs removidos e mantém os valores das linhas restantes", async () => {
    const user = userEvent.setup();
    renderSubject();
    await screen.findByText("Linha 3");

    await user.click(screen.getByRole("button", { name: "Remover última linha" }));
    expect(screen.getByDisplayValue(title.includes("P₂") ? "P 2" : "K 12")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Salvar Configuração" }));

    await waitFor(() => expect(deleteRow).toHaveBeenCalledWith(removedIds[0]));
    expect(deleteRow).toHaveBeenCalledTimes(1);
  });

  it("permite salvar a remoção de todas as linhas", async () => {
    const user = userEvent.setup();
    renderSubject();
    await screen.findByText("Linha 3");
    const removeButton = screen.getByRole("button", { name: "Remover última linha" });

    await user.click(removeButton);
    await user.click(removeButton);
    await user.click(removeButton);
    const saveButton = screen.getByRole("button", { name: "Salvar Configuração" });
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);

    await waitFor(() => expect(deleteRow).toHaveBeenCalledTimes(3));
    expect(vi.mocked(deleteRow).mock.calls.map(([id]) => id)).toEqual(removedIds);
  });
});
