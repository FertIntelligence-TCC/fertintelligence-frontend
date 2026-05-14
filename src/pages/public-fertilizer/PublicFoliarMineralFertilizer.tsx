import FoliarMineralFertilizerFormFields from "@/components/Fertilizers/FormFields/FoliarMineralFertilizerFormFields";
import PublicFertilizerListBase from "../public-fertilizer/PublicFertilizerListBase";
import { DEFAULT_MINERAL_FERTILIZER_FORM_STATE, MineralFertilizerResponseDto } from "@/interfaces/Fertilizer";
import { fetchPublicMineralFertilizers } from "@/services/foliarMineralFertilizerService";

export default function PublicFoliarMineralFertilizer() {
  return (
    <PublicFertilizerListBase<MineralFertilizerResponseDto, typeof DEFAULT_MINERAL_FERTILIZER_FORM_STATE>
      subtitle="Adubos Minerais Foliares Públicos"
      heading="Consultar adubos minerais foliares públicos"
      typeLabel="Foliar Mineral"
      backPath="/fertintelligence/fertilizer-management/foliar-mineral-fertilizer"
      queryKey={["foliar-mineral-public-fertilizers"]}
      fetchFn={fetchPublicMineralFertilizers}
      getId={(item) => item.id}
      getName={(item) => item.nome_adubo}
      getCreatorName={(item) => item.nome_criador || "Usuário"}
      toForm={(item) => ({ ...DEFAULT_MINERAL_FERTILIZER_FORM_STATE, nome: item.nome_adubo, n: String(item.n ?? 0), p2o5: String(item.p2o5 ?? 0), k2o: String(item.k2o ?? 0), ca: String(item.ca ?? 0), mg: String(item.mg ?? 0), s: String(item.s ?? 0), b: String(item.b ?? 0), cu: String(item.cu ?? 0), fe: String(item.fe ?? 0), mn: String(item.mn ?? 0), mo: String(item.mo ?? 0), zn: String(item.zn ?? 0), indiceSalino: String(item.indice_salino ?? 0), indiceAcidez: String(item.indice_acidez ?? 0), publico: item.publico ? "sim" : "nao" })}
      renderReadOnlyForm={(form) => <FoliarMineralFertilizerFormFields form={form} onChange={() => undefined} readOnly />}
    />
  );
}