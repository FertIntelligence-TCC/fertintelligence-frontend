import ChelatedFertilizerFormFields from "@/components/Fertilizers/FormFields/ChelatedFertilizerFormFields";
import { Text } from "@chakra-ui/react";
import PublicFertilizerListBase from "../public-fertilizer/PublicFertilizerListBase";
import { DEFAULT_CHELATED_FERTILIZER_FORM_STATE, ChelatedFertilizerResponseDto, getFertilizerPhotoIds } from "@/interfaces/Fertilizer";
import { fetchPublicChelatedFertilizers } from "@/services/chelatedFertilizerService";

const renderTechnicalDetails = (item: ChelatedFertilizerResponseDto) => (
  <>
    <Text fontSize="xs" color="gray.500" mt={2}>
      Especificações Técnicas:
    </Text>
    <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }} lineClamp={1}>
      Densidade: {item.densidade ?? "-"} g/ml | Vol.: {item.concentracao_volume ?? "-"} g/L | Massa: {item.concentracao_massa ?? "-"} g/kg
    </Text>
  </>
);

export default function PublicChelatedFertilizer() {
  return (
    <PublicFertilizerListBase<ChelatedFertilizerResponseDto, typeof DEFAULT_CHELATED_FERTILIZER_FORM_STATE>
      subtitle="Adubos Quelatados Públicos"
      heading="Consultar adubos quelatados públicos"
      typeLabel="Quelatado"
      backPath="/fertintelligence/fertilizer-management/chelated-fertilizer"
      queryKey={["chelated-public-fertilizers"]}
      fetchFn={fetchPublicChelatedFertilizers}
      getId={(item) => item.id}
      getName={(item) => item.nome_adubo}
      getCreatorName={(item) => item.nome_criador || "Usuário"}
      renderCardDetails={renderTechnicalDetails}
      toForm={(item) => ({ ...DEFAULT_CHELATED_FERTILIZER_FORM_STATE, nome: item.nome_adubo, fotoIds: getFertilizerPhotoIds(item), observacao: item.observacao ?? "", fonte: item.fonte ?? "", densidade: String(item.densidade ?? ""), concentracaoVolume: String(item.concentracao_volume ?? ""), concentracaoMassa: String(item.concentracao_massa ?? ""), n: String(item.n ?? 0), p2o5: String(item.p2o5 ?? 0), k2o: String(item.k2o ?? 0), ca: String(item.ca ?? 0), mg: String(item.mg ?? 0), s: String(item.s ?? 0), b: String(item.b ?? 0), cu: String(item.cu ?? 0), fe: String(item.fe ?? 0), mn: String(item.mn ?? 0), mo: String(item.mo ?? 0), zn: String(item.zn ?? 0), indiceSalino: String(item.indice_salino ?? 0), indiceAcidez: String(item.indice_acidez ?? 0), publico: item.publico ? "sim" : "nao" })}
      renderReadOnlyForm={(form) => <ChelatedFertilizerFormFields form={form} onChange={() => undefined} readOnly />}
    />
  );
}
