import {
    Dialog,
    Button,
    Field,
    Stack,
    Text,
  } from "@chakra-ui/react";
  import { useEffect, useMemo, useState } from "react";
  import { toaster } from "@/components/ui/toaster";
  import { requestPlotAccess } from "@/services/plotAccessRequestService";
  import { fetchMyProperties } from "@/services/propertyService";
  import { getPlotsByProperty } from "@/services/plotService";
  import { SelectElement } from "@/components/FertilizationTable/styles";
  import type { PermissionType } from "@/interfaces/PlotAccessRequest";
  
  type Property = { id: number; nome: string };
  type Plot = { id: number; identification: string };
  
  type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cargoNormalized: string;
  };
  
  export default function PlotPermissionsRequestDialog({
    open,
    onOpenChange,
    cargoNormalized,
  }: Props) {
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);
    const [plots, setPlots] = useState<Plot[]>([]);
    const [propertyId, setPropertyId] = useState<number | "">("");
    const [plotId, setPlotId] = useState<number | "">("");
  
    const isResident = cargoNormalized.includes("RESIDENTE");
    const isConsultor = cargoNormalized.includes("CONSULTOR");
    const isSecretary = cargoNormalized.includes("SECRETARIO");
  
    const mode = useMemo(() => {
      if (isResident) return "resident";
      if (isConsultor) return "consultor";
      if (isSecretary) return "secretary";
      return "other";
    }, [isResident, isConsultor, isSecretary]);
  
    const permissionType: PermissionType = useMemo(() => {
      if (mode === "secretary") return "EDIT_ANALYSES";
      return "EDIT_ANALYSES_AND_CROPS";
    }, [mode]);
  
    const requiresPlot = mode === "consultor" || mode === "secretary";
  
    const canSubmit =
      typeof propertyId === "number" && (!requiresPlot || typeof plotId === "number");

    useEffect(() => {
      if (!open || mode === "other") return;

      (async () => {
        try {
          const data = await fetchMyProperties();
          setProperties((data ?? []).map((property) => ({
            id: property.id,
            nome: property.nome,
          })));
        } catch {
          toaster.create({
            title: "Erro",
            description: "Não foi possível carregar as propriedades.",
            type: "error",
          });
        }
      })();
    }, [mode, open]);

    useEffect(() => {
      if (!requiresPlot || typeof propertyId !== "number") {
        setPlots([]);
        setPlotId("");
        return;
      }

      (async () => {
        try {
          const data = await getPlotsByProperty(propertyId);
          setPlots((data ?? []).map((plot) => ({
            id: plot.id,
            identification: plot.identificacao ?? "",
          })));
        } catch {
          toaster.create({
            title: "Erro",
            description: "Não foi possível carregar os talhões.",
            type: "error",
          });
        }
      })();
    }, [propertyId, requiresPlot]);
  
    const submit = async () => {
      if (!canSubmit) return;
  
        setLoading(true);
        try {
          await requestPlotAccess({
          propertyId: propertyId as number,
          plotId: requiresPlot ? (plotId as number) : null,
          permissionType,
        });
  
        toaster.create({
          title: "Solicitação enviada",
          type: "success",
        });
  
        onOpenChange(false);
        setPropertyId("");
        setPlotId("");
      } catch (e: any) {
        toaster.create({
          title: "Erro",
          description:
            e?.response?.data?.message ??
            "Não foi possível enviar a solicitação.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Solicitar Permissão</Dialog.Title>
            </Dialog.Header>
  
            <Dialog.Body>
              {mode === "other" ? (
                <Text>Seu cargo não possui este fluxo.</Text>
              ) : (
                <Stack gap="4">
                  <Field.Root required>
                    <Field.Label>Propriedade</Field.Label>
                    <SelectElement
                      w="full"
                      p={2}
                      borderWidth="1px"
                      borderRadius="md"
                      value={propertyId ? String(propertyId) : ""}
                      onChange={(e) => setPropertyId(e.target.value ? Number(e.target.value) : "")}
                    >
                      <option value="">Selecione uma propriedade</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome}
                        </option>
                      ))}
                    </SelectElement>
                  </Field.Root>
  
                  {requiresPlot && (
                    <Field.Root required>
                      <Field.Label>Talhão</Field.Label>
                      <SelectElement
                        w="full"
                        p={2}
                        borderWidth="1px"
                        borderRadius="md"
                        value={plotId ? String(plotId) : ""}
                        onChange={(e) => setPlotId(e.target.value ? Number(e.target.value) : "")}
                      >
                        <option value="">Selecione um talhão</option>
                        {plots.map((pl) => (
                          <option key={pl.id} value={pl.id}>
                            {pl.identification || `Talhão ${pl.id}`}
                          </option>
                        ))}
                      </SelectElement>
                    </Field.Root>
                  )}
  
                  <Text fontSize="sm" opacity={0.7}>
                    Tipo:{" "}
                    {permissionType === "EDIT_ANALYSES"
                      ? "Editar análises"
                      : "Editar análises e culturas"}
                  </Text>
                </Stack>
              )}
            </Dialog.Body>
  
            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                colorPalette="green"
                onClick={submit}
                loading={loading}
                disabled={!canSubmit || mode === "other"}
              >
                Enviar
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    );
  }
