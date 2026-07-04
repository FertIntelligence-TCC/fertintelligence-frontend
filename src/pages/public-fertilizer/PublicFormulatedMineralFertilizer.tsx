import FormulatedMineralFertilizerFormFields from "@/components/Fertilizers/FormFields/FormulatedMineralFertilizerFormFields";
import PublicFertilizerListBase from "../public-fertilizer/PublicFertilizerListBase";
import { DEFAULT_FORMULATED_FORM_STATE, FormulatedFertilizerFormState, FormulatedMineralFertilizerResponseDto, getFertilizerPhotoIds, fertilizerCommercialPriceResponseToForm } from "@/interfaces/Fertilizer";
import { fetchPublicFormulatedFertilizers } from "@/services/formulatedMineralFertilizerService";
import { formatNpkRelation } from "@/utils/npkRelation";

const toForm = (item: FormulatedMineralFertilizerResponseDto): FormulatedFertilizerFormState => {
  const relation = formatNpkRelation(item.relacao ?? { n: 0, p: 0, k: 0 });

  return {
    ...DEFAULT_FORMULATED_FORM_STATE,
    fotoIds: getFertilizerPhotoIds(item), ...fertilizerCommercialPriceResponseToForm(item),
    observacao: item.observacao ?? "",
    fonte: item.fonte ?? "",
    formulaN: String(item.formula?.n ?? 0),
    formulaP: String(item.formula?.p ?? 0),
    formulaK: String(item.formula?.k ?? 0),
    relacaoN: relation.n,
    relacaoP: relation.p,
    relacaoK: relation.k,
    n: String(item.n ?? 0),
    p2o5: String(item.p2o5 ?? 0),
    k2o: String(item.k2o ?? 0),
    ca: String(item.ca ?? 0),
    mg: String(item.mg ?? 0),
    s: String(item.s ?? 0),
    b: String(item.b ?? 0),
    cu: String(item.cu ?? 0),
    fe: String(item.fe ?? 0),
    mn: String(item.mn ?? 0),
    mo: String(item.mo ?? 0),
    zn: String(item.zn ?? 0),
    numeroFormulaIndicada: String(item.numero_formula_indicada ?? 0),
    publico: item.publico ? "sim" : "nao",
  };
};

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
      getName={(item) => `${item.formula?.n ?? 0}-${item.formula?.p ?? 0}-${item.formula?.k ?? 0}`}
      getCreatorName={(item) => item.nome_criador || "Usuário"}
      toForm={toForm}
      renderReadOnlyForm={(form) => <FormulatedMineralFertilizerFormFields form={form} onChange={() => undefined} readOnly setFormState={() => undefined} />}
    />
  );
}
