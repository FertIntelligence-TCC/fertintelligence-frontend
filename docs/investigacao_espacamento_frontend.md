# Investigacao de espacamento no frontend

## Escopo

Investigacao do fluxo frontend de cultura, pasta anual, geracao de recomendacao e exibicao da recomendacao direta. Nenhuma feature foi implementada nesta etapa.

## Entidades, componentes, services e interfaces encontrados

### Crop

- Interface: `src/interfaces/Crop.ts`
  - `CropResponseDto` define `distancia_entre_linhas` e `numero_plantas_por_metro` como parametros tecnicos da cultura.
  - `CropCreateRequestDto` envia os mesmos campos na criacao.
  - `CropPostRequestDto` usa `novo_distancia_entre_linhas` e `novo_numero_plantas_por_metro` na edicao.
- Service: `src/services/cropService.ts`
  - `createCrop(folderId, data)` usa `ENDPOINT.CREATE_CROP`.
  - `getCropById(cropId)` usa `ENDPOINT.GET_CROP`.
  - `getCropsByFolder(folderId)` usa `ENDPOINT.GET_CROP_BY_FOLDER`.
  - `updateCrop(cropId, data)` usa `ENDPOINT.UPDATE_CROP`.
  - `deleteCrop(cropId)` usa `ENDPOINT.DELETE_CROP`.
- Componentes principais:
  - `src/components/Crop/CropManagementDialog.tsx`: carrega culturas da pasta anual com `getCropsByFolder`, abre criacao/edicao e passa `folder.id` e `plotId` para o formulario.
  - `src/components/Crop/CropFormDialog.tsx`: renderiza o formulario de cultura, popula os campos de espacamento ao editar e envia os campos para criacao/atualizacao.
  - `src/components/Crop/CropList.tsx`: lista culturas e permite editar/excluir.
- Hooks:
  - Nao ha hook customizado dedicado para Crop. O fluxo usa hooks React locais (`useState`, `useEffect`, `useMemo`, `useCallback`) nos componentes.

### AnnualCropFolder

- Interface: `src/interfaces/AnnualCropFolder.ts`
  - `AnnualCropFolderResponseDto`, `AnnualCropFolderCreateRequestDto` e `AnnualCropFolderPostRequestDto`.
- Service: `src/services/annualCropFolderService.ts`
  - `createAnnualCropFolder(plotId, data)` usa `ENDPOINT.CREATE_ANNUAL_CROP_FOLDER`.
  - `getAllAnnualCropFoldersByPlot(plotId)` usa `ENDPOINT.GET_BY_PLOT_ANNUAL_CROP_FOLDER`.
  - `updateAnnualCropFolder(annualCropFolderId, data)` usa `ENDPOINT.UPDATE_ANNUAL_CROP_FOLDER`.
  - `deleteAnnualCropFolder(annualCropFolderId)` usa `ENDPOINT.DELETE_ANNUAL_CROP_FOLDER`.
- Componentes e pagina:
  - `src/pages/plot-entities/AnnualCropFolders.tsx`: pagina de gerenciamento das pastas anuais por talhao; carrega pastas, cria, edita, exclui e abre `CropManagementDialog`.
  - `src/components/AnnualCropFolder/AnnualCropFolderFormDialog.tsx`: formulario de criacao/edicao da pasta anual.
  - `src/components/AnnualCropFolder/AnnualCropFolderList.tsx`: lista as pastas e dispara abrir, editar e excluir.
- Hooks:
  - Nao ha hook customizado dedicado para AnnualCropFolder. A pagina usa hooks React locais.

### Recommendation

- Interface: `src/interfaces/Recommendation.ts`
  - `RecommendationCreatePayload` contem `id_pasta_cultura_anual`, `id_cultura`, ids das tabelas e opcoes de grupos.
  - `RecommendationResponse` contem dados retornados da recomendacao e campos de texto do laudo.
  - `getRecommendationReportText` extrai o texto do laudo geral de `laudo_tecnico`, `laudoTecnico` ou `technicalReport`.
- Service: `src/services/recommendationService.ts`
  - `buildRecommendationCreatePayload` monta o payload com os ids selecionados no frontend.
  - `generateRecommendation` usa `ENDPOINT.GENERATE_RECOMMENDATION`.
  - `getRecommendation`, `getMyRecommendations`, `preparePrintRecommendation`, `deleteRecommendation` e `improveRecommendationNarrative` usam endpoints existentes em `Endpoint.ts`.
- Pagina orquestradora:
  - `src/pages/recommendation/Recommendation.tsx` importa services, interfaces e componentes de selecao/renderizacao.
  - Mantem estado local para propriedade, talhao, pasta anual, cultura, tabelas, documentos carregados e historico.
  - Continua funcionando como orquestrador: seleciona dados, valida entrada, chama service e renderiza documentos. A logica agronomica e o calculo da recomendacao permanecem fora do frontend.
- Componentes auxiliares:
  - `src/components/Recommendation/CropTableSelectors.tsx`: renderiza seletores de pasta anual, cultura e tabelas.
  - `src/components/Recommendation/RecommendationFolderDocuments.tsx`: monta os cards de documentos, incluindo "Recomendacao Direta", e chama `RecommendationReportViewer`.
  - `src/components/Recommendation/RecommendationReportViewer.tsx`: parser/renderizador generico do texto retornado pelo backend.
- Hooks:
  - Nao ha hook customizado dedicado para Recommendation. O fluxo usa hooks React locais em `Recommendation.tsx`.

### DirectRecommendation

- Interface: `src/interfaces/Recommendation.ts`
  - `DirectRecommendationResponse` estende os campos de texto comuns e aceita `recomendacao_direta`, `recomendacaoDireta`, `direct` ou `directRecommendation`.
- Service: `src/services/directRecommendationService.ts`
  - `getDirectRecommendationByRecommendation(recommendationId)` usa `ENDPOINT.GET_DIRECT_RECOMMENDATION_BY_RECOMMENDATION`.
- Renderizacao:
  - `src/pages/recommendation/Recommendation.tsx` carrega o documento direto quando o usuario seleciona o card `direct`.
  - `src/components/Recommendation/RecommendationFolderDocuments.tsx` define o card "Recomendacao Direta" e entrega o texto carregado ao viewer.
  - `src/components/Recommendation/RecommendationReportViewer.tsx` renderiza o conteudo como texto/heading/tabela Markdown.
- Hooks:
  - Nao ha hook customizado dedicado para DirectRecommendation.

## Onde a secao Espacamento e renderizada

A secao "Espacamento" esta em `src/components/Crop/CropFormDialog.tsx`, dentro da aba `dados-gerais` do formulario de cultura.

Ela renderiza:

- `Distancia entre linhas (m)`, ligado ao estado `distanciaEntreLinhas`.
- `Plantas por metro`, ligado ao estado `plantasPorMetro`.
- `Populacao Estimada`, calculada no frontend apenas para exibicao com a formula local `(10000 * plants) / dist`.

Observacao tecnica: esse calculo local e somente uma estimativa visual no formulario de cultura. Ele nao substitui nem move a logica agronomica de recomendacao para o frontend.

## Onde Recommendation.tsx carrega a cultura

O carregamento da cultura ocorre em `src/pages/recommendation/Recommendation.tsx` em dois passos:

1. Quando o talhao muda, `loadPlotDependencies` busca analises do talhao e pastas anuais com `getAllAnnualCropFoldersByPlot(plotId)`.
2. Quando `annualCropFolderId` muda, o efeito `loadCrops` chama `getCropsByFolder(Number(annualCropFolderId))` e preenche o estado `crops`.

A cultura selecionada e resolvida por `selectedCrop = crops.find((crop) => String(crop.id) === cropId) ?? null`. Esse objeto e usado na validacao da geracao, enquanto o payload enviado ao backend leva `id_cultura` via `buildRecommendationCreatePayload`.

## Onde a tabela direta renderiza g/m linear e g/cova

Nao existe, no frontend atual, um componente especifico para a tabela direta de N, P2O5 e K2O ou para colunas como `g/m linear` e `g/cova`.

O fluxo encontrado e:

1. `Recommendation.tsx` chama `getDirectRecommendationByRecommendation(recommendationId)`.
2. O texto do documento direto e extraido por `getRecommendationDocumentText`.
3. `RecommendationFolderDocuments` passa o conteudo para `RecommendationReportViewer`.
4. `RecommendationReportViewer` identifica tabelas Markdown por linhas que comecam e terminam com `|`, ignora a linha separadora `---`, monta `rows` e renderiza uma tabela HTML generica.

Portanto, se `g/m linear`, `g/cova`, `N`, `P2O5` e `K2O` aparecem na tela, eles vem do texto/Markdown retornado pelo backend no documento de recomendacao direta. O frontend apenas parseia e renderiza a tabela generica; nao calcula nem renomeia essas colunas.

## Limitacoes encontradas

- A investigacao ficou limitada ao repositorio frontend e aos arquivos existentes.
- Nao foi localizado hook customizado dedicado para Crop, AnnualCropFolder, Recommendation ou DirectRecommendation.
- Nao ha tipagem estrutural especifica para linhas da tabela direta de nutrientes; o contrato atual e texto/documento.
- Nao ha componente especializado para a tabela de N, P2O5 e K2O; qualquer ajuste de calculo, unidade ou presenca de `g/m linear` e `g/cova` depende do backend retornar essas informacoes no documento direto.
- Para implementar feature futura sem inventar endpoint, sera necessario confirmar o contrato real retornado por `direct-recommendation/get-by-recommendation` ou ajustar o backend antes de estruturar uma UI mais especifica.
