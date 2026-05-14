import GreenFertilizerFormFields from "@/components/Fertilizers/FormFields/GreenFertilizerFormFields";
import PublicFertilizerListBase from "../public-fertilizer/PublicFertilizerListBase";
import { DEFAULT_GREEN_FERTILIZER_FORM_STATE, GreenFertilizerResponseDto } from "@/interfaces/Fertilizer";
import { fetchPublicGreenFertilizers } from "@/services/greenFertilizerService";

export default function PublicGreenFertilizer() {
  return (
    <PublicFertilizerListBase<GreenFertilizerResponseDto, typeof DEFAULT_GREEN_FERTILIZER_FORM_STATE>
      subtitle="Adubos Verdes Públicos"
      heading="Consultar adubos verdes públicos"
      typeLabel="Adubo Verde"
      backPath="/fertintelligence/fertilizer-management/green-fertilizer"
      queryKey={["green-public-fertilizers"]}
      fetchFn={fetchPublicGreenFertilizers}
      getId={(item) => item.id}
      getName={(item) => item.nome_adubo}
      getCreatorName={(item) => item.nome_criador || "Usuário"}
      toForm={(item) => ({ ...DEFAULT_GREEN_FERTILIZER_FORM_STATE, nome: item.nome_adubo, c: String(item.c ?? 0), n: String(item.n ?? 0), p2o5: String(item.p2o5 ?? 0), k2o: String(item.k2o ?? 0), ca: String(item.ca ?? 0), mg: String(item.mg ?? 0), s: String(item.s ?? 0), b: String(item.b ?? 0), cu: String(item.cu ?? 0), fe: String(item.fe ?? 0), mn: String(item.mn ?? 0), mo: String(item.mo ?? 0), zn: String(item.zn ?? 0), indiceSalino: String(item.indice_salino ?? 0), indiceAcidez: String(item.indice_acidez ?? 0), publico: item.publico ? "sim" : "nao" })}
      renderReadOnlyForm={(form) => <GreenFertilizerFormFields form={form} onChange={() => undefined} readOnly />}
    />
  );
}