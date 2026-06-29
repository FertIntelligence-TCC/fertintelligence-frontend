# Investigacao Markdown frontend

Investigacao do fluxo de exibicao dos textos de recomendacao no frontend React/Vite/TypeScript. Nenhuma funcionalidade foi alterada nesta etapa.

## Componentes envolvidos

- `src/pages/recommendation/Recommendation.tsx`
  - Orquestra a tela de recomendacao.
  - Carrega recomendacoes do historico e detalhe da recomendacao geral.
  - Carrega documentos complementares da pasta: recomendacao resumida, recomendacao direta e lista de compras.
  - Extrai texto de campos conhecidos do payload retornado pelos services.

- `src/components/Recommendation/RecommendationFolderDocuments.tsx`
  - Renderiza a "Pasta de Recomendacoes".
  - Monta cards para `general`, `summary`, `direct` e `shopping`.
  - Envia o texto selecionado para `RecommendationReportViewer`.
  - Tambem renderiza tabelas estruturadas quando o documento direto ou a lista de compras trazem arrays estruturados.

- `src/components/Recommendation/RecommendationReportViewer.tsx`
  - Renderiza o texto do documento em tela.
  - Faz parsing manual de alguns padroes de Markdown:
    - linhas de tabela que comecam e terminam com `|`;
    - linha separadora de tabela Markdown;
    - prefixos de cabecalho `#`, `##`, ate `######`, somente no fluxo de identificacao de titulos numerados.
  - Nao usa uma biblioteca externa de Markdown.

- `src/components/Recommendation/RecommendationPrintDocument.ts`
  - Reutiliza `parseRecommendationReportBlocks` e `detectRecommendationSpacingMode` de `RecommendationReportViewer`.
  - Gera HTML de impressao para o laudo.
  - Escapa HTML antes de escrever no documento de impressao.

- `src/components/Recommendation/RecommendationStructuredFertilizerTables.tsx`
  - Renderiza tabelas estruturadas quando ha conteudo estruturado no documento direto ou na lista de compras.
  - Nao interpreta Markdown.

## Services e endpoints usados

Todos os services usam endpoints existentes em `src/constants/Endpoint.ts`.

- `src/services/recommendationService.ts`
  - `generateRecommendation` usa `ENDPOINT.GENERATE_RECOMMENDATION`.
  - `getRecommendation` usa `ENDPOINT.GET_RECOMMENDATION`.
  - `getMyRecommendations` usa `ENDPOINT.GET_MY_RECOMMENDATION`.
  - `preparePrintRecommendation` usa `ENDPOINT.PREPARE_PRINT_RECOMMENDATION`.
  - `deleteRecommendation` usa `ENDPOINT.DELETE_RECOMMENDATION`.
  - `improveRecommendationNarrative` usa `ENDPOINT.IMPROVE_NARRATIVE_RECOMMENDATION`.

- `src/services/summaryRecommendationService.ts`
  - `getSummaryRecommendationByRecommendation` usa `ENDPOINT.GET_SUMMARY_RECOMMENDATION_BY_RECOMMENDATION`.

- `src/services/directRecommendationService.ts`
  - `getDirectRecommendationByRecommendation` usa `ENDPOINT.GET_DIRECT_RECOMMENDATION_BY_RECOMMENDATION`.

- `src/services/shoppingListService.ts`
  - `getShoppingListByRecommendation` usa `ENDPOINT.GET_SHOPPING_LIST_BY_RECOMMENDATION`.

## Interfaces e DTOs usados

Arquivo principal: `src/interfaces/Recommendation.ts`.

- `RecommendationResponse`
  - Usado para recomendacao geral.
  - Campos de texto aceitos por `getRecommendationReportText`: `laudo_tecnico`, `laudoTecnico` e `technicalReport`.

- `SummaryRecommendationResponse`
  - Estende campos comuns de documento.
  - Campos especificos aceitos: `resumo`, `summary`, `recomendacao_resumida`, `recomendacaoResumida`, `summaryRecommendation`.

- `DirectRecommendationResponse`
  - Estende campos comuns de documento e `RecommendationStructuredFertilizerLines`.
  - Campos especificos aceitos: `recomendacao_direta`, `recomendacaoDireta`, `direct`, `directRecommendation`.

- `ShoppingListResponse`
  - Estende campos comuns de documento e `RecommendationStructuredFertilizerLines`.
  - Campos especificos aceitos: `lista_compras`, `listaCompras`, `shoppingList`.

- Campos comuns de documento aceitos em `Recommendation.tsx`:
  - `conteudo`, `content`, `texto`, `text`, `documento`, `document`, `markdown`, `relatorio`, `report`.

## Fluxo de renderizacao encontrado

1. O usuario gera ou abre uma recomendacao em `Recommendation.tsx`.
2. Para a recomendacao geral, o texto vem de `getRecommendationReportText(selectedRecommendation)`, que retorna o primeiro campo disponivel entre `laudo_tecnico`, `laudoTecnico` e `technicalReport`.
3. Para documentos complementares, `Recommendation.tsx` chama o service correspondente:
   - resumo: `getSummaryRecommendationByRecommendation`;
   - direta: `getDirectRecommendationByRecommendation`;
   - lista de compras: `getShoppingListByRecommendation`.
4. `getRecommendationDocumentText` procura primeiro campos especificos do tipo de documento e depois campos comuns, incluindo `markdown`.
5. `buildRecommendationDocumentViews` monta os cards/documentos com o texto encontrado.
6. `RecommendationFolderDocuments` passa `selectedDocument.content` para `RecommendationReportViewer`.
7. `RecommendationReportViewer` transforma o texto em blocos por `parseRecommendationReportBlocks`:
   - linhas vazias viram espacamento;
   - linhas de tabela Markdown viram tabela HTML via Chakra;
   - cabecalhos Markdown sao normalizados por `normalizeMarkdownHeading`, mas so viram bloco `heading` se, depois da remocao dos `#`, tambem casarem com titulo numerado (`1.`, `1.1.`, etc.);
   - demais linhas sao exibidas como texto com `whiteSpace="pre-wrap"`.
8. Para impressao, `RecommendationPrintDocument.ts` usa o mesmo parser e escreve HTML no popup de impressao.

## Verificacao de bibliotecas Markdown

Nao foi encontrada dependencia nem import de bibliotecas como:

- `react-markdown`;
- `marked`;
- `remark`;
- `rehype`;
- `markdown-it`;
- `showdown`;
- `micromark`;
- `mdast`.

O projeto possui apenas parsing manual/local em `RecommendationReportViewer.tsx`.

## Origem dos caracteres `#`

O frontend nao adiciona caracteres `#` ao texto das recomendacoes.

O frontend aceita texto vindo do backend em campos de texto, inclusive um campo chamado `markdown`, e faz interpretacao parcial/manual desse conteudo. A regra atual remove prefixos `#` apenas quando a linha, sem os `#`, tambem corresponde a um titulo numerado, por exemplo `## 1. Introducao`.

Se o backend retornar uma linha Markdown sem numeracao, por exemplo `## Introducao`, o parser calcula `Introducao` para testar se e titulo numerado, mas como nao casa com `sectionTitleRegex`, a linha original e renderizada como texto. Nesse caso, os `#` aparecem na interface porque ja estavam no conteudo recebido e nao foram removidos pelo parser.

Portanto, com base no codigo frontend, a origem mais provavel dos `#` exibidos e o conteudo textual retornado pelo backend em formato Markdown ou semelhante. O frontend apenas preserva esses caracteres quando a linha nao entra nas regras parciais de cabecalho/tabela. Esta investigacao nao confirma o payload real em runtime, pois nao houve chamada ao backend nesta etapa.

## Recomendacao para correcao futura

Antes de alterar a renderizacao, confirmar com payload real qual campo esta trazendo os `#` (`laudo_tecnico`, `technicalReport`, `markdown`, `recomendacao_direta`, etc.).

Com essa confirmacao, ha duas alternativas consistentes:

- corrigir a origem no backend para enviar texto final sem sintaxe Markdown quando o frontend deve exibir texto plano;
- ou assumir oficialmente que o contrato e Markdown e ajustar o frontend para interpretar Markdown de forma completa e previsivel, incluindo cabecalhos nao numerados, listas e enfases.

Nao foi feita correcao neste prompt porque o escopo e exclusivamente investigativo.
