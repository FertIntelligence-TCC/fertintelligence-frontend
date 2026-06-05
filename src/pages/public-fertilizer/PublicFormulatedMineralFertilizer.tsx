import FormulatedMineralFertilizerFormFields from "@/components/Fertilizers/FormFields/FormulatedMineralFertilizerFormFields";
import PublicFertilizerListBase from "../public-fertilizer/PublicFertilizerListBase";
import { DEFAULT_FORMULATED_FORM_STATE, FormulatedMineralFertilizerResponseDto } from "@/interfaces/Fertilizer";
import { fetchPublicFormulatedFertilizers } from "@/services/formulatedMineralFertilizerService";
import { formatNpkValue } from "@/components/Fertilizers/Shared/formatters";

export default function PublicFormulatedMineralFertilizer() {
  return (
    <PublicFertilizerListBase<FormulatedMineralFertilizerResponseDto, typeof DEFAULT_FORMULATED_FORM_STATE>
      subtitle="Adubos Minerais Formulados Públicos"
      heading="Consultar adubos minerais formulados públicos"
      typeLabel="Formulado"
      backPath="/fertintelligence/fertilizer-management/formulated-mineral-fertilizer"
      queryKey={["formulated-public-fertilizers"]}
      fetchFn={fetchPublicFormulatedFertilizers}
      getId={(item) => item.id}
      getName={(item) => `${formatNpkValue(item.formula?.n)}-${formatNpkValue(item.formula?.p)}-${formatNpkValue(item.formula?.k)}`}
      getCreatorName={(item) => item.nome_criador || "Usuário"}
      toForm={(item) => ({ ...DEFAULT_FORMULATED_FORM_STATE, formulaN: formatNpkValue(item.formula?.n), formulaP: formatNpkValue(item.formula?.p), formulaK: formatNpkValue(item.formula?.k), relacaoN: formatNpkValue(item.relacao?.n), relacaoP: formatNpkValue(item.relacao?.p), relacaoK: formatNpkValue(item.relacao?.k), n: String(item.n ?? 0), p2o5: String(item.p2o5 ?? 0), k2o: String(item.k2o ?? 0), ca: String(item.ca ?? 0), mg: String(item.mg ?? 0), s: String(item.s ?? 0), b: String(item.b ?? 0), cu: String(item.cu ?? 0), fe: String(item.fe ?? 0), mn: String(item.mn ?? 0), mo: String(item.mo ?? 0), zn: String(item.zn ?? 0), numeroFormulaIndicada: String(item.numero_formula_indicada ?? 0), publico: item.publico ? "sim" : "nao" })}
      renderReadOnlyForm={(form) => <FormulatedMineralFertilizerFormFields form={form} onChange={() => undefined} readOnly setFormState={() => undefined} />}
    />
  );
}
