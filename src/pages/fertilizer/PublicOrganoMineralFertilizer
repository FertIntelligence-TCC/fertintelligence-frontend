import OrganoMineralFertilizerFormFields from "@/components/Fertilizers/FormFields/OrganoMineralFertilizerFormFields";
import PublicFertilizerListBase from "./PublicFertilizerListBase";
import { DEFAULT_ORGANO_MINERAL_FORM_STATE, OrganoMineralFertilizerResponseDto } from "@/interfaces/Fertilizer";
import { fetchPublicOrganoMineralFertilizers } from "@/services/organoMineralFertilizerService";

export default function PublicOrganoMineralFertilizer() {
  return (
    <PublicFertilizerListBase<OrganoMineralFertilizerResponseDto, typeof DEFAULT_ORGANO_MINERAL_FORM_STATE>
      subtitle="Adubos Organominerais Públicos"
      heading="Consultar adubos organominerais públicos"
      typeLabel="Organomineral"
      backPath="/fertintelligence/fertilizer-management/organo-mineral-fertilizer"
      queryKey={["organo-public-fertilizers"]}
      fetchFn={fetchPublicOrganoMineralFertilizers}
      getId={(item) => item.id}
      getName={(item) => item.nome_adubo}
      getCreatorName={(item) => item.nome_criador || "Usuário"}
      toForm={(item) => ({ ...DEFAULT_ORGANO_MINERAL_FORM_STATE, nome: item.nome_adubo, c: String(item.c ?? 0), n: String(item.n ?? 0), p2o5: String(item.p2o5 ?? 0), k2o: String(item.k2o ?? 0), ca: String(item.ca ?? 0), mg: String(item.mg ?? 0), s: String(item.s ?? 0), b: String(item.b ?? 0), cu: String(item.cu ?? 0), fe: String(item.fe ?? 0), mn: String(item.mn ?? 0), mo: String(item.mo ?? 0), zn: String(item.zn ?? 0), indiceSalino: String(item.indice_salino ?? 0), indiceAcidez: String(item.indice_acidez ?? 0), publico: item.publico ? "sim" : "nao" })}
      renderReadOnlyForm={(form) => <OrganoMineralFertilizerFormFields form={form} onChange={() => undefined} readOnly />}
    />
  );
}