import BioFertilizerFormFields from "@/components/Fertilizers/FormFields/BioFertilizerFormFields";
import BioFertilizerTechnicalDetails from "@/components/Fertilizers/Shared/BioFertilizerTechnicalDetails";
import PublicFertilizerListBase from "./PublicFertilizerListBase";
import { DEFAULT_BIO_FERTILIZER_FORM_STATE, BioFertilizerResponseDto, getFertilizerPhotoIds, fertilizerCommercialPriceResponseToForm } from "@/interfaces/Fertilizer";
import { fetchPublicBioFertilizers } from "@/services/bioFertilizerService";

export default function PublicBioFertilizer() {
  return (
    <PublicFertilizerListBase<BioFertilizerResponseDto, typeof DEFAULT_BIO_FERTILIZER_FORM_STATE>
      subtitle="Biofertilizantes Públicos"
      heading="Consultar biofertilizantes públicos"
      typeLabel="Biofertilizante"
      backPath="/fertintelligence/fertilizer-management/bio-fertilizer"
      queryKey={["bio-public-fertilizers"]}
      fetchFn={fetchPublicBioFertilizers}
      getId={(item) => item.id}
      getName={(item) => item.nome_adubo}
      getCreatorName={(item) => item.nome_criador || "Usuário"}
      renderCardDetails={(item) => <BioFertilizerTechnicalDetails item={item} mt={2} />}
      toForm={(item) => ({ ...DEFAULT_BIO_FERTILIZER_FORM_STATE, nome: item.nome_adubo, fotoIds: getFertilizerPhotoIds(item), ...fertilizerCommercialPriceResponseToForm(item), observacao: item.observacao ?? "", fonte: item.fonte ?? "", densidade: String(item.densidade_g_ml ?? ""), concentracaoVolume: String(item.concentracao_volume_g_l ?? ""), concentracaoMassa: String(item.concentracao_massa_g_kg ?? ""), proteinas: String(item.proteinas_g_l ?? ""), aminoacidos: String(item.aminoacidos_g_l ?? ""), amidos: String(item.amidos_g_l ?? ""), acucares: String(item.acucares_g_l ?? ""), compostosDiversos: String(item.compostos_diversos_g_l ?? ""), n: String(item.n ?? 0), p2o5: String(item.p2o5 ?? 0), k2o: String(item.k2o ?? 0), ca: String(item.ca ?? 0), mg: String(item.mg ?? 0), s: String(item.s ?? 0), b: String(item.b ?? 0), cu: String(item.cu ?? 0), fe: String(item.fe ?? 0), mn: String(item.mn ?? 0), mo: String(item.mo ?? 0), zn: String(item.zn ?? 0), indiceSalino: String(item.indice_salino ?? 0), indiceAcidez: String(item.indice_acidez ?? 0), publico: item.publico ? "sim" : "nao" })}
      renderReadOnlyForm={(form) => <BioFertilizerFormFields form={form} onChange={() => undefined} readOnly />}
    />
  );
}
