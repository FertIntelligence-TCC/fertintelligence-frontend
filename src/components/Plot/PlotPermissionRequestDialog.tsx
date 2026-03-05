import {
    Dialog,
    Button,
    Field,
    Select,
    Stack,
    Text,
  } from "@chakra-ui/react";
  import { useEffect, useMemo, useState } from "react";
  import { toaster } from "@/components/ui/toaster";
  import { requestPlotAccess, PermissionType } from "@/services/plotAccessRequestService";
  
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
  
    const submit = async () => {
      if (!canSubmit) return;
  
      setLoading(true);
      try {
        await requestPlotAccess({
          id_propriedade: propertyId as number,
          id_talhao: requiresPlot ? (plotId as number) : null,
          tipo_permissao: permissionType,
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
                    <Select.Root
                      value={propertyId ? String(propertyId) : ""}
                      onValueChange={(e) =>
                        setPropertyId(e.value ? Number(e.value) : "")
                      }
                    >
                      <Select.Trigger />
                      <Select.Content>
                        {properties.map((p) => (
                          <Select.Item key={p.id} value={String(p.id)}>
                            {p.nome}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Field.Root>
  
                  {requiresPlot && (
                    <Field.Root required>
                      <Field.Label>Talhão</Field.Label>
                      <Select.Root
                        value={plotId ? String(plotId) : ""}
                        onValueChange={(e) =>
                          setPlotId(e.value ? Number(e.value) : "")
                        }
                      >
                        <Select.Trigger />
                        <Select.Content>
                          {plots.map((pl) => (
                            <Select.Item key={pl.id} value={String(pl.id)}>
                              {pl.identification || `Talhão ${pl.id}`}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
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