import { useEffect, useState } from "react";
import {
  Dialog,
  Button,
  Input,
  Text,
  Grid,
  Box,
  VStack,
  Spinner,
  Field
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import {
  getSalinityByTable,
  createSalinity,
  updateSalinity
} from "@/services/salinityInterpretationService";
import {
  SalinityInterpretationCreateRequestDto,
  SalinityInterpretationPostRequestDto
} from "@/interfaces/SalinityInterpretation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null; // ID da tabela pai
  isReadOnly?: boolean;
}

// Estado inicial vazio para o formulário
const INITIAL_STATE = {
  // Normal
  normal_soil_highest_ce: "", normal_soil_highest_pst: "", normal_soil_highest_ph: "", normal_soil_highest_ras: "",
  // Salino
  saline_soil_lowest_ce: "", saline_soil_highest_pst: "", saline_soil_highest_ph: "", saline_soil_highest_ras: "",
  // Salino-Sódico
  sodic_saline_soil_highest_ce: "", sodic_saline_soil_lowest_pst: "", sodic_saline_soil_lowest_ph: "", sodic_saline_soil_lowest_ras: "",
  // Sódico
  sodic_soil_highest_ce: "", sodic_soil_lowest_pst: "", sodic_soil_lowest_ph: "", sodic_soil_lowest_ras: "",
};

export default function SalinityTableModal({ isOpen, onClose, tableId, isReadOnly = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null); // Se null = Create, Se número = Update
  const [form, setForm] = useState(INITIAL_STATE);

  // Carregar dados ao abrir o modal
  useEffect(() => {
    if (isOpen && tableId) {
      fetchData();
    } else {
      // Reseta se fechar ou não tiver ID
      setForm(INITIAL_STATE);
      setExistingId(null);
    }
  }, [isOpen, tableId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getSalinityByTable(tableId!);
      if (data) {
        setExistingId(data.id);
        // Preenche o formulário convertendo números para string (para exibição no input)
        const newForm: any = {};
        Object.keys(INITIAL_STATE).forEach(key => {
            // @ts-ignore - Acesso dinâmico seguro pelo Object.keys
            newForm[key] = data[key] !== null && data[key] !== undefined ? String(data[key]) : "";
        });
        setForm(newForm);
      } else {
        setExistingId(null); // Modo Criação (nenhum dado existente para esta tabela)
        setForm(INITIAL_STATE);
      }
    } catch (error) {
      console.error(error);
      // Opcional: não mostrar erro se for 404, pois significa apenas que ainda não foi criado
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Função auxiliar para converter string -> float (aceita vírgula ou ponto)
      const parse = (val: string) => {
        if (!val) return 0;
        return parseFloat(val.replace(',', '.')) || 0;
      };

      if (existingId) {
        // --- UPDATE (Usa DTO com prefixo "novo_") ---
        const payload: SalinityInterpretationPostRequestDto = {
          novo_maior_ce_solo_normal: parse(form.normal_soil_highest_ce),
          novo_maior_pst_solo_normal: parse(form.normal_soil_highest_pst),
          novo_maior_ph_solo_normal: parse(form.normal_soil_highest_ph),
          novo_maior_ras_solo_normal: parse(form.normal_soil_highest_ras),

          novo_menor_ce_solo_salino: parse(form.saline_soil_lowest_ce),
          novo_maior_pst_solo_salino: parse(form.saline_soil_highest_pst),
          novo_maior_ph_solo_salino: parse(form.saline_soil_highest_ph),
          novo_maior_ras_solo_salino: parse(form.saline_soil_highest_ras),

          novo_maior_ce_solo_salino_sodico: parse(form.sodic_saline_soil_highest_ce),
          novo_menor_pst_solo_salino_sodico: parse(form.sodic_saline_soil_lowest_pst),
          novo_menor_ph_solo_salino_sodico: parse(form.sodic_saline_soil_lowest_ph),
          novo_menor_ras_solo_salino_sodico: parse(form.sodic_saline_soil_lowest_ras),

          novo_maior_ce_solo_sodico: parse(form.sodic_soil_highest_ce),
          novo_menor_pst_solo_sodico: parse(form.sodic_soil_lowest_pst),
          novo_menor_ph_solo_sodico: parse(form.sodic_soil_lowest_ph),
          novo_menor_ras_solo_sodico: parse(form.sodic_soil_lowest_ras),
        };
        await updateSalinity(existingId, payload);
        toaster.create({ title: "Salinidade atualizada com sucesso!", type: "success" });

      } else {
        // --- CREATE (Usa DTO com nomes em português sem prefixo) ---
        const payload: SalinityInterpretationCreateRequestDto = {
          maior_ce_solo_normal: parse(form.normal_soil_highest_ce),
          maior_pst_solo_normal: parse(form.normal_soil_highest_pst),
          maior_ph_solo_normal: parse(form.normal_soil_highest_ph),
          maior_ras_solo_normal: parse(form.normal_soil_highest_ras),

          menor_ce_solo_salino: parse(form.saline_soil_lowest_ce),
          maior_pst_solo_salino: parse(form.saline_soil_highest_pst),
          maior_ph_solo_salino: parse(form.saline_soil_highest_ph),
          maior_ras_solo_salino: parse(form.saline_soil_highest_ras),

          maior_ce_solo_salino_sodico: parse(form.sodic_saline_soil_highest_ce),
          menor_pst_solo_salino_sodico: parse(form.sodic_saline_soil_lowest_pst),
          menor_ph_solo_salino_sodico: parse(form.sodic_saline_soil_lowest_ph),
          menor_ras_solo_salino_sodico: parse(form.sodic_saline_soil_lowest_ras),

          maior_ce_solo_sodico: parse(form.sodic_soil_highest_ce),
          menor_pst_solo_sodico: parse(form.sodic_soil_lowest_pst),
          menor_ph_solo_sodico: parse(form.sodic_soil_lowest_ph),
          menor_ras_solo_sodico: parse(form.sodic_soil_lowest_ras),
        };
        
        await createSalinity(tableId!, payload);
        toaster.create({ title: "Salinidade configurada com sucesso!", type: "success" });
        onClose(); // Fecha após criar com sucesso
      }
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Erro ao salvar.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Helper para renderizar os grupos de inputs (DRY)
  const renderGroup = (title: string, fields: { label: string, key: keyof typeof INITIAL_STATE }[]) => (
    <Box borderWidth="1px" p={3} borderRadius="md" _dark={{ borderColor: "gray.600" }}>
      <Text fontWeight="bold" mb={3} color="green.600" _dark={{ color: "green.300" }} fontSize="sm">{title}</Text>
      <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={3}>
        {fields.map((f) => (
          <Field.Root key={f.key}>
             {/* CORREÇÃO DE VISIBILIDADE DO RÓTULO */}
             <Field.Label fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }}>
                {f.label}
             </Field.Label>
             
             {/* CORREÇÃO DE VISIBILIDADE DO INPUT */}
             <Input 
                size="sm" 
                type="number" 
                step="0.01"
                value={form[f.key]} 
                onChange={(e) => handleChange(f.key, e.target.value)}
                readOnly={isReadOnly}
                bg="white"
                borderColor="gray.300"
                _dark={{ bg: "gray.700", borderColor: "gray.500" }}
             />
          </Field.Root>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content bg="white" _dark={{ bg: "gray.800" }}>
          <Dialog.Header>
            <Dialog.Title>Configurar Salinidade</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            {loading ? (
               <Box textAlign="center" py={10}><Spinner size="xl" color="green.500"/></Box>
            ) : (
              <VStack gap={4} align="stretch">
                {renderGroup("Solo Normal", [
                  { label: "Maior CE (dS/m)", key: "normal_soil_highest_ce" },
                  { label: "Maior PST (%)", key: "normal_soil_highest_pst" },
                  { label: "Maior pH", key: "normal_soil_highest_ph" },
                  { label: "Maior RAS (mmolc)**0.5", key: "normal_soil_highest_ras" },
                ])}
                {renderGroup("Solo Salino", [
                  { label: "Menor CE (dS/m)", key: "saline_soil_lowest_ce" },
                  { label: "Maior PST (%)", key: "saline_soil_highest_pst" },
                  { label: "Maior pH", key: "saline_soil_highest_ph" },
                  { label: "Maior RAS (mmolc)**0.5", key: "saline_soil_highest_ras" },
                ])}
                {renderGroup("Solo Salino-Sódico", [
                  { label: "Menor CE (dS/m)", key: "sodic_saline_soil_highest_ce" },
                  { label: "Menor PST (%)", key: "sodic_saline_soil_lowest_pst" },
                  { label: "Menor pH", key: "sodic_saline_soil_lowest_ph" },
                  { label: "Menor RAS", key: "sodic_saline_soil_lowest_ras" },
                ])}
                {renderGroup("Solo Sódico", [
                  { label: "Maior CE (dS/m)", key: "sodic_soil_highest_ce" },
                  { label: "Menor PST (%)", key: "sodic_soil_lowest_pst" },
                  { label: "Menor pH", key: "sodic_soil_lowest_ph" },
                  { label: "Menor RAS", key: "sodic_soil_lowest_ras" },
                ])}
              </VStack>
            )}
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="ghost" onClick={onClose}>Fechar</Button>
            {!isReadOnly && (
              <Button colorPalette="green" onClick={handleSave} loading={saving}>
                Salvar Configuração
              </Button>
            )}
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
