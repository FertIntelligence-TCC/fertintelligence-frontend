import {
    Dialog,
    Button,
    Field,
    Stack,
    Text,
    chakra,
  } from "@chakra-ui/react";
  import { useMemo, useState } from "react";
  import { toaster } from "@/components/ui/toaster";
  import { requestPlotAccess } from "@/services/plotAccessRequestService";
  import type { PermissionType } from "@/interfaces/PlotAccessRequest";
  
  type Property = { id: number; nome: string };
  type Plot = { id: number; identification: string };
  const NativeSelect = chakra("select");
  
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
    const [properties] = useState<Property[]>([]);
    const [plots] = useState<Plot[]>([]);
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
                    <NativeSelect
                      value={propertyId ? String(propertyId) : ""}
                      onChange={(e) =>
                        setPropertyId(e.target.value ? Number(e.target.value) : "")
                      }
                      p={2}
                      borderWidth="1px"
                      borderRadius="md"
                    >
                      <option value="">Selecione uma propriedade</option>
                      {properties.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {p.nome}
                        </option>
                      ))}
                    </NativeSelect>
                  </Field.Root>
  
                  {requiresPlot && (
                    <Field.Root required>
                      <Field.Label>Talhão</Field.Label>
                      <NativeSelect
                        value={plotId ? String(plotId) : ""}
                        onChange={(e) =>
                          setPlotId(e.target.value ? Number(e.target.value) : "")
                        }
                        p={2}
                        borderWidth="1px"
                        borderRadius="md"
                      >
                        <option value="">Selecione um talhão</option>
                        {plots.map((pl) => (
                          <option key={pl.id} value={String(pl.id)}>
                            {pl.identification || `Talhão ${pl.id}`}
                          </option>
                        ))}
                      </NativeSelect>
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
