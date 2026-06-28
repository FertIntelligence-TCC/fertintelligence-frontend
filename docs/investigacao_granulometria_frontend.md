# Investigacao da granulometria na analise fisica

## Escopo

Investigacao do frontend React/Vite/TypeScript sobre onde a Analise Fisica do solo coleta, exibe e envia os campos de granulometria:

- Areia
- Silte
- Argila

Nao houve alteracao funcional neste prompt.

## Componentes e paginas localizados

### `src/components/PlotAnalysis/PhysicalAnalysisFormDialog.tsx`

Formulario principal de criacao, edicao e visualizacao da Analise Fisica.

Pontos relevantes:

- Inicializa novos extratos com `teorAreia`, `teorSilte` e `teorArgila` em `0`.
- Exibe a secao de granulometria no formulario.
- Atualiza o estado local via `handleChangeExtract`.
- Monta `payloadFisico` para criar ou atualizar o extrato fisico.

Labels encontrados:

- `Granulometria (g/dm³)`
- `Areia (g/dm³)`
- `Silte (g/dm³)`
- `Argila (g/dm³)`

Observacao: o texto exibido como `GRANULOMETRIA (G/DM³)` vem do componente `SectionHeader`, que aplica `textTransform="uppercase"` sobre o titulo `Granulometria (g/dm³)`.

Payload de create:

```ts
const payloadFisico = {
  teor_areia: ext.teorAreia,
  teor_silte: ext.teorSilte,
  teor_argila: ext.teorArgila,
  ...
};

await physicalAnalysisExtractService.create(
  payloadFisico,
  mode === "RANGE" ? extractId : undefined,
  mode === "LAYER" ? extractId : undefined,
);
```

Payload de update:

```ts
const updatePayload: PhysicalAnalysisExtractUpdatePayload = {};

Object.entries(payloadFisico).forEach(([key, val]) => {
  const prefix = feminineKeys.includes(key) ? "nova_" : "novo_";
  updatePayload[`${prefix}${key}`] = val;
});

await physicalAnalysisExtractService.update(ext.databaseId, updatePayload);
```

Para granulometria, isso gera:

- `novo_teor_areia`
- `novo_teor_silte`
- `novo_teor_argila`

### `src/pages/plot-entities/PhysicalAnalysis.tsx`

Pagina de gerenciamento/listagem das analises fisicas de um talhao.

Pontos relevantes:

- Busca analises por talhao via `soilAnalysisService.getByPlotId`.
- Busca extratos por camada ou intervalo.
- Busca dados fisicos por extrato.
- Mapeia resposta do backend para `PhysicalExtractFormData`.
- Renderiza cards com os valores de granulometria.

Labels encontrados na listagem:

- `Areia: ... g/dm³`
- `Silte: ... g/dm³`
- `Argila: ... g/dm³`

Mapeamento dos campos:

```ts
teorAreia: p.teor_areia,
teorSilte: p.teor_silte,
teorArgila: p.teor_argila,
```

### `src/components/Plot/PlotDetailsDialog.tsx`

Dialog de detalhes do talhao tambem possui mapeamento dos dados fisicos para `PhysicalExtractFormData`.

Mapeamento encontrado:

```ts
teorAreia: data.teor_areia,
teorSilte: data.teor_silte,
teorArgila: data.teor_argila,
```

## Types localizados

### `src/interfaces/PhysicalAnalysisFormTypes.ts`

Define o estado usado pelo formulario:

```ts
teorAreia: number;
teorSilte: number;
teorArgila: number;
```

Nao ha unidade documentada no tipo.

### `src/interfaces/PhysicalAnalysisExtract.ts`

Define resposta e payloads do extrato fisico.

Resposta:

```ts
teor_areia: number;
teor_silte: number;
teor_argila: number;
```

Create:

```ts
teor_areia: number;
teor_silte: number;
teor_argila: number;
```

Update:

```ts
novo_teor_areia?: number;
novo_teor_silte?: number;
novo_teor_argila?: number;
```

Nao ha unidade documentada nos DTOs/interfaces do frontend.

## Services e endpoints localizados

### `src/services/physicalAnalysisExtractService.ts`

Service responsavel por criar, buscar, atualizar e deletar extratos fisicos.

Operacoes relevantes:

- `create(payload, rangeExtractId?, layerExtractId?)`
- `getByRangeExtractId(rangeExtractId)`
- `getByLayerExtractId(layerExtractId)`
- `update(physicalAnalysisExtractId, payload)`

### `src/constants/Endpoint.ts`

Endpoints preservados e usados pelo service:

- `CREATE_PHYSICAL_ANALYSIS_EXTRACT`: `physical-analysis-extract/register`
- `UPDATE_PHYSICAL_ANALYSIS_EXTRACT`: `physical-analysis-extract/update`
- `GET_BY_LAYER_PHYSICAL_ANALYSIS_EXTRACT`: `physical-analysis-extract/get-by-layer`
- `GET_BY_RANGE_PHYSICAL_ANALYSIS_EXTRACT`: `physical-analysis-extract/get-by-range`
- `GET_PHYSICAL_ANALYSIS_EXTRACT`: `physical-analysis-extract/get`
- `DELETE_PHYSICAL_ANALYSIS_EXTRACT`: `physical-analysis-extract/delete`

## Recommendation

### `src/pages/recommendation/Recommendation.tsx`

A Recommendation carrega extratos fisicos do talhao e usa o extrato selecionado.

Pontos encontrados:

- Busca extratos fisicos por camada ou intervalo com `physicalAnalysisExtractService`.
- Monta opcoes de select com `mapPhysicalAnalysisOption`.
- Guarda o extrato selecionado em `selectedPhysicalAnalysisExtract`.
- Usa `physicalExtract?.teor_argila` em `calculateClientLimingCriterion`.
- Envia o ID do extrato fisico no payload de geracao.

Nao foi encontrada renderizacao explicita de um "diagnostico fisico" com Areia/Silte/Argila no frontend da Recommendation. O frontend renderiza:

- seletor de analise fisica;
- seletor de classificacao textural;
- preview de criterio/necessidade de calagem, que usa `teor_argila` localmente quando disponivel.

### `src/components/Recommendation/AnalysisSelectors.tsx`

Renderiza o select de analise fisica:

- placeholder `Análise física do talhão`;
- opcoes formatadas pela pagina `Recommendation.tsx`.

### `src/components/Recommendation/TextureClassificationSystemSelect.tsx`

Renderiza o select:

- `Qual classificação textural de solos usar?`
- opcoes `Brasileiro` e `Americano`.

### `src/services/recommendationService.ts`

Monta payload de geracao da Recommendation.

Campos relacionados:

```ts
physicalAnalysisExtractId: normalizedPhysicalAnalysisExtractId,
id_extrato_analise_fisica: normalizedPhysicalAnalysisExtractId,
classificacao_textural: normalizeTexturalClassification(texturalClassification),
```

## Pontos de alteracao futuros

Para alterar apenas a unidade exibida de granulometria de `g/dm³` para `g/kg`, os pontos frontend identificados sao:

- `src/components/PlotAnalysis/PhysicalAnalysisFormDialog.tsx`
  - titulo da secao `Granulometria (g/dm³)`;
  - labels `Areia (g/dm³)`, `Silte (g/dm³)`, `Argila (g/dm³)`.
- `src/pages/plot-entities/PhysicalAnalysis.tsx`
  - labels exibidos nos cards `Areia`, `Silte`, `Argila` com sufixo `g/dm³`.

Pontos que exigem cuidado:

- O frontend nao possui metadado de unidade nos tipos ou payloads.
- O payload atual envia apenas numeros para `teor_areia`, `teor_silte` e `teor_argila`.
- Analises antigas podem ter sido cadastradas enquanto a tela indicava `g/dm³`; sem metadado de unidade no backend/frontend, nao ha como o frontend distinguir automaticamente valores antigos de novos.
- Nao deve ser criado calculo agronomico no frontend para converter ou inferir unidade sem contrato explicito do backend.
