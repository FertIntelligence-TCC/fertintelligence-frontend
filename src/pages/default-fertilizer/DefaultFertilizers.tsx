import BioFertilizerFormFields from "@/components/Fertilizers/FormFields/BioFertilizerFormFields";
import ChelatedFertilizerFormFields from "@/components/Fertilizers/FormFields/ChelatedFertilizerFormFields";
import FoliarMineralFertilizerFormFields from "@/components/Fertilizers/FormFields/FoliarMineralFertilizerFormFields";
import FormulatedMineralFertilizerFormFields from "@/components/Fertilizers/FormFields/FormulatedMineralFertilizerFormFields";
import GreenFertilizerFormFields from "@/components/Fertilizers/FormFields/GreenFertilizerFormFields";
import OrganicFertilizerFormFields from "@/components/Fertilizers/FormFields/OrganicFertilizerFormFields";
import OrganoMineralFertilizerFormFields from "@/components/Fertilizers/FormFields/OrganoMineralFertilizerFormFields";
import SimpleMineralFertilizerFormFields from "@/components/Fertilizers/FormFields/SimpleMineralFertilizerFormFields";
import PublicFertilizerListBase from "@/pages/public-fertilizer/PublicFertilizerListBase";
import { Text } from "@chakra-ui/react";
import {
  BioFertilizerFormState,
  BioFertilizerResponseDto,
  ChelatedFertilizerFormState,
  ChelatedFertilizerResponseDto,
  DEFAULT_BIO_FERTILIZER_FORM_STATE,
  DEFAULT_CHELATED_FERTILIZER_FORM_STATE,
  DEFAULT_FORMULATED_FORM_STATE,
  DEFAULT_GREEN_FERTILIZER_FORM_STATE,
  DEFAULT_MINERAL_FERTILIZER_FORM_STATE,
  DEFAULT_ORGANIC_FERTILIZER_FORM_STATE,
  DEFAULT_ORGANO_MINERAL_FORM_STATE,
  DEFAULT_SIMPLE_MINERAL_FORM_STATE,
  FormulatedFertilizerFormState,
  FormulatedMineralFertilizerResponseDto,
  GreenFertilizerFormState,
  GreenFertilizerResponseDto,
  MineralFertilizerFormState,
  MineralFertilizerResponseDto,
  OrganicFertilizerFormState,
  OrganicFertilizerResponseDto,
  OrganoMineralFertilizerFormState,
  OrganoMineralFertilizerResponseDto,
  SimpleMineralFertilizerFormState,
  SimpleMineralFertilizerResponseDto,
} from "@/interfaces/Fertilizer";
import { fetchDefaultBioFertilizers } from "@/services/bioFertilizerService";
import { fetchDefaultChelatedFertilizers } from "@/services/chelatedFertilizerService";
import { fetchDefaultMineralFertilizers } from "@/services/foliarMineralFertilizerService";
import { fetchDefaultFormulatedFertilizers } from "@/services/formulatedMineralFertilizerService";
import { formatNpkRelation } from "@/utils/npkRelation";
import { fetchDefaultGreenFertilizers } from "@/services/greenFertilizerService";
import { fetchDefaultOrganicFertilizers } from "@/services/organicFertilizerService";
import { fetchDefaultOrganoMineralFertilizers } from "@/services/organoMineralFertilizerService";
import { fetchDefaultSimpleMineralFertilizers } from "@/services/simpleMineralFertilizerService";

const defaultListProps = {
  listLabel: "padrão",
  backLabel: "Voltar para adubos padrão",
  dialogTitle: "Visualizar adubo padrão",
  backPath: "/fertintelligence/fertilizer-management/default",
};

const creatorName = (name?: string) => name || "Usuário supremo";

const renderMineralPhysicalNatureDetails = (item: MineralFertilizerResponseDto) => {
  const naturezaFisica = item.natureza_fisica ?? "SOLIDO";
  const isLiquid = naturezaFisica === "LIQUIDO";

  return (
    <>
      <Text fontSize="xs" color="gray.500" mt={2}>
        Natureza Física:
      </Text>
      <Text fontSize="sm" fontWeight="semibold">
        {isLiquid ? "LÍQUIDO" : "SÓLIDO"}
      </Text>
      {isLiquid && (
        <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }} lineClamp={1}>
          Densidade: {item.densidade ?? "-"} g/ml | Vol.: {item.concentracao_volume ?? "-"} g/L | Massa: {item.concentracao_massa ?? "-"} g/kg
        </Text>
      )}
    </>
  );
};

type BaseNutrientFertilizer = SimpleMineralFertilizerResponseDto
  | MineralFertilizerResponseDto
  | ChelatedFertilizerResponseDto
  | BioFertilizerResponseDto;

const publicValue = (publico?: boolean): "sim" | "nao" => (publico ? "sim" : "nao");

const toBaseNutrientForm = <T extends BaseNutrientFertilizer>(item: T) => ({
  ...DEFAULT_SIMPLE_MINERAL_FORM_STATE,
  nome: item.nome_adubo,
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
  indiceSalino: String(item.indice_salino ?? 0),
  indiceAcidez: String(item.indice_acidez ?? 0),
  publico: publicValue(item.publico),
});

const toSimpleMineralForm = (item: SimpleMineralFertilizerResponseDto): SimpleMineralFertilizerFormState =>
  toBaseNutrientForm(item);

const toMineralForm = (item: MineralFertilizerResponseDto): MineralFertilizerFormState => ({
  ...DEFAULT_MINERAL_FERTILIZER_FORM_STATE,
  ...toBaseNutrientForm(item),
  naturezaFisica: item.natureza_fisica ?? "SOLIDO",
  densidade: String(item.densidade ?? ""),
  concentracaoVolume: String(item.concentracao_volume ?? ""),
  concentracaoMassa: String(item.concentracao_massa ?? ""),
});

const toChelatedForm = (item: ChelatedFertilizerResponseDto): ChelatedFertilizerFormState =>
  toBaseNutrientForm(item);

const toBioForm = (item: BioFertilizerResponseDto): BioFertilizerFormState =>
  toBaseNutrientForm(item);

const toOrganoMineralForm = (item: OrganoMineralFertilizerResponseDto): OrganoMineralFertilizerFormState => ({
  ...DEFAULT_ORGANO_MINERAL_FORM_STATE,
  nome: item.nome_adubo,
  c: String(item.c ?? 0),
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
  indiceSalino: String(item.indice_salino ?? 0),
  indiceAcidez: String(item.indice_acidez ?? 0),
  publico: publicValue(item.publico),
});

const toGreenForm = (item: GreenFertilizerResponseDto): GreenFertilizerFormState => ({
  ...DEFAULT_GREEN_FERTILIZER_FORM_STATE,
  nome: item.nome_adubo,
  c: String(item.c ?? 0),
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
  publico: publicValue(item.publico),
});

const toOrganicForm = (item: OrganicFertilizerResponseDto): OrganicFertilizerFormState => ({
  ...DEFAULT_ORGANIC_FERTILIZER_FORM_STATE,
  nome: item.nome_adubo,
  teorUmidade: String(item.teor_umidade ?? 0),
  teorCinzas: String(item.teor_cinzas ?? 0),
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
  publico: publicValue(item.publico),
});

const toFormulatedForm = (item: FormulatedMineralFertilizerResponseDto): FormulatedFertilizerFormState => {
  const relation = formatNpkRelation(item.relacao ?? { n: 0, p: 0, k: 0 });

  return {
    ...DEFAULT_FORMULATED_FORM_STATE,
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
    publico: publicValue(item.publico),
  };
};

export function DefaultSimpleMineralFertilizer() {
  return (
    <PublicFertilizerListBase<SimpleMineralFertilizerResponseDto, typeof DEFAULT_SIMPLE_MINERAL_FORM_STATE>
      {...defaultListProps}
      subtitle="Adubos Minerais Simples Padrão"
      heading="Consultar adubos minerais simples padrão"
      typeLabel="Mineral Simples"
      queryKey={["simple-mineral-default-fertilizers"]}
      fetchFn={fetchDefaultSimpleMineralFertilizers}
      getId={(item) => item.id}
      getName={(item) => item.nome_adubo}
      getCreatorName={(item) => creatorName(item.nome_criador)}
      toForm={toSimpleMineralForm}
      renderReadOnlyForm={(form) => <SimpleMineralFertilizerFormFields form={form} onChange={() => undefined} readOnly />}
    />
  );
}

export function DefaultFormulatedMineralFertilizer() {
  return (
    <PublicFertilizerListBase<FormulatedMineralFertilizerResponseDto, typeof DEFAULT_FORMULATED_FORM_STATE>
      {...defaultListProps}
      subtitle="Adubos Minerais Formulados Padrão"
      heading="Consultar adubos minerais formulados padrão"
      typeLabel="Formulado"
      queryKey={["formulated-default-fertilizers"]}
      fetchFn={fetchDefaultFormulatedFertilizers}
      getId={(item) => item.id}
      getName={(item) => `${item.formula?.n ?? 0}-${item.formula?.p ?? 0}-${item.formula?.k ?? 0}`}
      getCreatorName={(item) => creatorName(item.nome_criador)}
      toForm={toFormulatedForm}
      renderReadOnlyForm={(form) => <FormulatedMineralFertilizerFormFields form={form} onChange={() => undefined} readOnly setFormState={() => undefined} />}
    />
  );
}

export function DefaultOrganoMineralFertilizer() {
  return (
    <PublicFertilizerListBase<OrganoMineralFertilizerResponseDto, typeof DEFAULT_ORGANO_MINERAL_FORM_STATE>
      {...defaultListProps}
      subtitle="Adubos Organominerais Padrão"
      heading="Consultar adubos organominerais padrão"
      typeLabel="Organomineral"
      queryKey={["organo-default-fertilizers"]}
      fetchFn={fetchDefaultOrganoMineralFertilizers}
      getId={(item) => item.id}
      getName={(item) => item.nome_adubo}
      getCreatorName={(item) => creatorName(item.nome_criador)}
      toForm={toOrganoMineralForm}
      renderReadOnlyForm={(form) => <OrganoMineralFertilizerFormFields form={form} onChange={() => undefined} readOnly />}
    />
  );
}

export function DefaultGreenFertilizer() {
  return (
    <PublicFertilizerListBase<GreenFertilizerResponseDto, typeof DEFAULT_GREEN_FERTILIZER_FORM_STATE>
      {...defaultListProps}
      subtitle="Adubos Verdes Padrão"
      heading="Consultar adubos verdes padrão"
      typeLabel="Adubo Verde"
      queryKey={["green-default-fertilizers"]}
      fetchFn={fetchDefaultGreenFertilizers}
      getId={(item) => item.id}
      getName={(item) => item.nome_adubo}
      getCreatorName={(item) => creatorName(item.nome_criador)}
      toForm={toGreenForm}
      renderReadOnlyForm={(form) => <GreenFertilizerFormFields form={form} onChange={() => undefined} readOnly />}
    />
  );
}

export function DefaultOrganicFertilizer() {
  return (
    <PublicFertilizerListBase<OrganicFertilizerResponseDto, typeof DEFAULT_ORGANIC_FERTILIZER_FORM_STATE>
      {...defaultListProps}
      subtitle="Adubos Orgânicos Padrão"
      heading="Consultar adubos orgânicos padrão"
      typeLabel="Adubo Orgânico"
      queryKey={["organic-default-fertilizers"]}
      fetchFn={fetchDefaultOrganicFertilizers}
      getId={(item) => item.id}
      getName={(item) => item.nome_adubo}
      getCreatorName={(item) => creatorName(item.nome_criador)}
      toForm={toOrganicForm}
      renderReadOnlyForm={(form) => <OrganicFertilizerFormFields form={form} onChange={() => undefined} readOnly />}
    />
  );
}

export function DefaultFoliarMineralFertilizer() {
  return (
    <PublicFertilizerListBase<MineralFertilizerResponseDto, typeof DEFAULT_MINERAL_FERTILIZER_FORM_STATE>
      {...defaultListProps}
      subtitle="Adubos Minerais Foliares Padrão"
      heading="Consultar adubos minerais foliares padrão"
      typeLabel="Foliar Mineral"
      queryKey={["foliar-mineral-default-fertilizers"]}
      fetchFn={fetchDefaultMineralFertilizers}
      getId={(item) => item.id}
      getName={(item) => item.nome_adubo}
      getCreatorName={(item) => creatorName(item.nome_criador)}
      renderCardDetails={renderMineralPhysicalNatureDetails}
      toForm={toMineralForm}
      renderReadOnlyForm={(form) => <FoliarMineralFertilizerFormFields form={form} onChange={() => undefined} readOnly />}
    />
  );
}

export function DefaultChelatedFertilizer() {
  return (
    <PublicFertilizerListBase<ChelatedFertilizerResponseDto, typeof DEFAULT_CHELATED_FERTILIZER_FORM_STATE>
      {...defaultListProps}
      subtitle="Adubos Quelatados Padrão"
      heading="Consultar adubos quelatados padrão"
      typeLabel="Quelatado"
      queryKey={["chelated-default-fertilizers"]}
      fetchFn={fetchDefaultChelatedFertilizers}
      getId={(item) => item.id}
      getName={(item) => item.nome_adubo}
      getCreatorName={(item) => creatorName(item.nome_criador)}
      toForm={toChelatedForm}
      renderReadOnlyForm={(form) => <ChelatedFertilizerFormFields form={form} onChange={() => undefined} readOnly />}
    />
  );
}

export function DefaultBioFertilizer() {
  return (
    <PublicFertilizerListBase<BioFertilizerResponseDto, typeof DEFAULT_BIO_FERTILIZER_FORM_STATE>
      {...defaultListProps}
      subtitle="Biofertilizantes Padrão"
      heading="Consultar biofertilizantes padrão"
      typeLabel="Biofertilizante"
      queryKey={["bio-default-fertilizers"]}
      fetchFn={fetchDefaultBioFertilizers}
      getId={(item) => item.id}
      getName={(item) => item.nome_adubo}
      getCreatorName={(item) => creatorName(item.nome_criador)}
      toForm={toBioForm}
      renderReadOnlyForm={(form) => <BioFertilizerFormFields form={form} onChange={() => undefined} readOnly />}
    />
  );
}
