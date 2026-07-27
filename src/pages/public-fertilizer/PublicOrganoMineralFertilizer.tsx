import OrganoMineralFertilizerFormFields from "@/components/Fertilizers/FormFields/OrganoMineralFertilizerFormFields";
import PublicFertilizerListBase from "./PublicFertilizerListBase";
import { DEFAULT_ORGANO_MINERAL_FORM_STATE, OrganoMineralFertilizerResponseDto } from "@/interfaces/Fertilizer";
import { fetchPublicOrganoMineralFertilizers } from "@/services/organoMineralFertilizerService";
import { mapOrganoMineralResponseToForm } from "@/pages/fertilizer/OrganoMineralFertilizer";

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
      toForm={mapOrganoMineralResponseToForm}
      renderReadOnlyForm={(form) => <OrganoMineralFertilizerFormFields form={form} onChange={() => undefined} readOnly />}
    />
  );
}
