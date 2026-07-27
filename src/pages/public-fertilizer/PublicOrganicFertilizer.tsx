import OrganicFertilizerFormFields from "@/components/Fertilizers/FormFields/OrganicFertilizerFormFields";
import PublicFertilizerListBase from "./PublicFertilizerListBase";
import { DEFAULT_ORGANIC_FERTILIZER_FORM_STATE, OrganicFertilizerResponseDto } from "@/interfaces/Fertilizer";
import { fetchPublicOrganicFertilizers } from "@/services/organicFertilizerService";
import { mapOrganicResponseToForm } from "@/pages/fertilizer/OrganicFertilizer";

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
      toForm={mapOrganicResponseToForm}
      renderReadOnlyForm={(form) => <OrganicFertilizerFormFields form={form} onChange={() => undefined} readOnly />}
    />
  );
}
