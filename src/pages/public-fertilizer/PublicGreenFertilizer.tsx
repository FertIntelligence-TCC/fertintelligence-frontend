import GreenFertilizerFormFields from "@/components/Fertilizers/FormFields/GreenFertilizerFormFields";
import PublicFertilizerListBase from "../public-fertilizer/PublicFertilizerListBase";
import { DEFAULT_GREEN_FERTILIZER_FORM_STATE, GreenFertilizerResponseDto } from "@/interfaces/Fertilizer";
import { fetchPublicGreenFertilizers } from "@/services/greenFertilizerService";
import { mapGreenResponseToForm } from "@/pages/fertilizer/GreenFertilizer";

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
      toForm={mapGreenResponseToForm}
      renderReadOnlyForm={(form) => <GreenFertilizerFormFields form={form} onChange={() => undefined} readOnly />}
    />
  );
}
