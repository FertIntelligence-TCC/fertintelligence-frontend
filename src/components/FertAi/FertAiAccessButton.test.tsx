import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import FertAiAccessButton, { FERT_AI_ROUTE } from "./FertAiAccessButton";

describe("FertAiAccessButton", () => {
  it("navega sem recarregar a página para a rota própria do Fert-IA", async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter initialEntries={["/fertintelligence/recommendation"]}>
          <Routes>
            <Route
              path="/fertintelligence/recommendation"
              element={<FertAiAccessButton />}
            />
            <Route path={FERT_AI_ROUTE} element={<div>Página exclusiva Fert-IA</div>} />
          </Routes>
        </MemoryRouter>
      </ChakraProvider>,
    );

    const button = screen.getByRole("button", { name: "Abrir Fert-IA" });
    expect(button.closest("[aria-label='Acesso ao Fert-IA']")).toBeInTheDocument();

    await userEvent.click(button);

    expect(screen.getByText("Página exclusiva Fert-IA")).toBeInTheDocument();
  });
});
