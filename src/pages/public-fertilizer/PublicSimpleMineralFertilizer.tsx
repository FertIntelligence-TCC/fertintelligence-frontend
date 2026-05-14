import SimpleMineralFertilizerFormFields from "@/components/Fertilizers/FormFields/SimpleMineralFertilizerFormFields";
import PublicFertilizerListBase from "./PublicFertilizerListBase";
import { DEFAULT_SIMPLE_MINERAL_FORM_STATE, SimpleMineralFertilizerResponseDto } from "@/interfaces/Fertilizer";
import { fetchPublicSimpleMineralFertilizers } from "@/services/simpleMineralFertilizerService";

export default function PublicSimpleMineralFertilizer() {
  return (
    <PublicFertilizerListBase<SimpleMineralFertilizerResponseDto, typeof DEFAULT_SIMPLE_MINERAL_FORM_STATE>
      subtitle="Adubos Minerais Simples Públicos"
      heading="Consultar adubos minerais simples públicos"
      typeLabel="Mineral Simples"
      backPath="/fertintelligence/fertilizer-management/simple-mineral-fertilizer"
      queryKey={["simple-mineral-public-fertilizers"]}
      fetchFn={fetchPublicSimpleMineralFertilizers}
      getId={(item) => item.id}
      getName={(item) => item.nome_adubo}
      getCreatorName={(item) => item.nome_criador || "Usuário"}
      toForm={(item) => ({ ...DEFAULT_SIMPLE_MINERAL_FORM_STATE, nome: item.nome_adubo, n: String(item.n ?? 0), p2o5: String(item.p2o5 ?? 0), k2o: String(item.k2o ?? 0), ca: String(item.ca ?? 0), mg: String(item.mg ?? 0), s: String(item.s ?? 0), b: String(item.b ?? 0), cu: String(item.cu ?? 0), fe: String(item.fe ?? 0), mn: String(item.mn ?? 0), mo: String(item.mo ?? 0), zn: String(item.zn ?? 0), indiceSalino: String(item.indice_salino ?? 0), indiceAcidez: String(item.indice_acidez ?? 0), publico: item.publico ? "sim" : "nao" })}
      renderReadOnlyForm={(form) => <SimpleMineralFertilizerFormFields form={form} onChange={() => undefined} readOnly />}
    />
  );
}