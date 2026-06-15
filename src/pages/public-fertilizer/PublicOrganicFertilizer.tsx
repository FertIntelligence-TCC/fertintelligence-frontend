import OrganicFertilizerFormFields from "@/components/Fertilizers/FormFields/OrganicFertilizerFormFields";
import PublicFertilizerListBase from "./PublicFertilizerListBase";
import { DEFAULT_ORGANIC_FERTILIZER_FORM_STATE, OrganicFertilizerResponseDto, getFertilizerPhotoIds } from "@/interfaces/Fertilizer";
import { fetchPublicOrganicFertilizers } from "@/services/organicFertilizerService";

export default function PublicOrganicFertilizer() {
  return (
    <PublicFertilizerListBase<OrganicFertilizerResponseDto, typeof DEFAULT_ORGANIC_FERTILIZER_FORM_STATE>
      subtitle="Adubos Orgânicos Públicos"
      heading="Consultar adubos orgânicos públicos"
      typeLabel="Adubo Orgânico"
      backPath="/fertintelligence/fertilizer-management/organic-fertilizer"
      queryKey={["organic-public-fertilizers"]}
      fetchFn={fetchPublicOrganicFertilizers}
      getId={(item) => item.id}
      getName={(item) => item.nome_adubo}
      getCreatorName={(item) => item.nome_criador || "Usuário"}
      toForm={(item) => ({ ...DEFAULT_ORGANIC_FERTILIZER_FORM_STATE, nome: item.nome_adubo, fotoIds: getFertilizerPhotoIds(item), observacao: item.observacao ?? "", fonte: item.fonte ?? "", teorUmidade: String(item.teor_umidade ?? 0), teorCinzas: String(item.teor_cinzas ?? 0), n: String(item.n ?? 0), p2o5: String(item.p2o5 ?? 0), k2o: String(item.k2o ?? 0), ca: String(item.ca ?? 0), mg: String(item.mg ?? 0), s: String(item.s ?? 0), b: String(item.b ?? 0), cu: String(item.cu ?? 0), fe: String(item.fe ?? 0), mn: String(item.mn ?? 0), mo: String(item.mo ?? 0), zn: String(item.zn ?? 0), publico: item.publico ? "sim" : "nao" })}
      renderReadOnlyForm={(form) => <OrganicFertilizerFormFields form={form} onChange={() => undefined} readOnly />}
    />
  );
}
