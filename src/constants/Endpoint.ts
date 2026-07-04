export const ENDPOINT = {
  // --- Authentication Endpoints ---
  ME: "me",
  SIGN_IN: "authentication/authenticate",

  // --- User Endpoints ---
  CREATE_NEW_USER: "user/register",
  GET_USER: "user/get",
  UPDATE_USER: "user/update",
  DELETE_USER: "user/delete",

  // --- Property Endpoints ---
  CREATE_PROPERTY: "property/register",
  GET_PROPERTY_BY_ID: "property/get",
  GET_MY_PROPERTIES: "property/get-my-properties",
  UPDATE_PROPERTY: "property/update",
  DELETE_PROPERTY: "property/delete",
  SEARCH_PROPERTIES: "property/search",
  GET_MANAGEABLE_PROPERTIES: "property/get-manageable-properties",

  // --- Property Access Request Endpoints ---
  CREATE_PROPERTY_ACCESS_REQUEST: "property-access/request",
  GET_REQUESTS_FOR_PROPERTY: "property-access/requests",
  GET_APPROVED_REQUESTS_BY_USER: "property-access/my-approved-properties",
  DECIDE_PROPERTY_ACCESS_REQUEST: "property-access/{requestId}/decision",
  LEAVE_PROPERTY_ACCESS_REQUEST: "property-access/leave",

  // --- Plot Endpoints ---
  CREATE_PLOT: "plot/register",
  GET_BY_PROPERTY_PLOT: "plot/get-by-property",
  GET_PLOT: "plot/get",
  UPDATE_PLOT: "plot/update",
  DELETE_PLOT: "plot/delete",

  // --- Plot Access Request Endpoints ---
  CREATE_PLOT_ACCESS_REQUEST: "plot-access/request",
  GET_PLOT_ACCESS_REQUESTS: "plot-access/requests",
  DECIDE_PLOT_ACCESS_REQUEST: "plot-access/{requestId}/decision",
  REVOKE_PLOT_ACCESS_REQUEST: "plot-access/{requestId}/revoke",

  // --- Annual Crop Folder Endpoints ---
  CREATE_ANNUAL_CROP_FOLDER: "annual-crop-folder/register",
  GET_BY_PLOT_ANNUAL_CROP_FOLDER: "annual-crop-folder/get-by-plot",
  UPDATE_ANNUAL_CROP_FOLDER: "annual-crop-folder/update",
  DELETE_ANNUAL_CROP_FOLDER: "annual-crop-folder/delete",

  // --- Crop Endpoints ---
  CREATE_CROP: "crop/register",
  GET_CROP: "crop/get",
  GET_CROP_BY_FOLDER: "crop/get-by-folder",
  UPDATE_CROP: "crop/update",
  DELETE_CROP: "crop/delete",

  // --- Available P Anion Exchange Resin Extractor Endpoints ---
  GET_BY_TABLE_AVAILABLE_P_ANION_EXCHANGE_RESIN_EXTRACTOR: "available-p-anion-exchange-resin-extractor/get-by-table",
  CREATE_AVAILABLE_P_ANION_EXCHANGE_RESIN_EXTRACTOR: "available-p-anion-exchange-resin-extractor/register",
  UPDATE_AVAILABLE_P_ANION_EXCHANGE_RESIN_EXTRACTOR: "available-p-anion-exchange-resin-extractor/update",
  GET_BY_TABLE_AVAILABLE_P_MEHLICH_1_EXTRACTOR: "available-p-mehlich-1-extractor/get-by-table",
  CREATE_AVAILABLE_P_MEHLICH_1_EXTRACTOR: "available-p-mehlich-1-extractor/register",
  UPDATE_AVAILABLE_P_MEHLICH_1_EXTRACTOR: "available-p-mehlich-1-extractor/update",

  // --- Available S Endpoints ---
  GET_BY_TABLE_AVAILABLE_S: "available-s/get-by-table",
  CREATE_AVAILABLE_S: "available-s/register",
  UPDATE_AVAILABLE_S: "available-s/update",

  // --- Sulfur Dose Endpoints ---
  GET_BY_TABLE_SULFUR_DOSE: "sulfur-dose/get-by-table",
  CREATE_SULFUR_DOSE: "sulfur-dose/register",
  UPDATE_SULFUR_DOSE: "sulfur-dose/update",

  // --- Micronutrient Dose Endpoints ---
  GET_BY_TABLE_MICRONUTRIENT_DOSE: "micronutrient-dose/get-by-table",
  CREATE_MICRONUTRIENT_DOSE: "micronutrient-dose/register",
  UPDATE_MICRONUTRIENT_DOSE: "micronutrient-dose/update",

  // --- CTC Saturation Endpoints ---
  GET_BY_TABLE_CTC_SATURATION: "ctc-saturation/get-by-table",
  CREATE_CTC_SATURATION: "ctc-saturation/register",
  UPDATE_CTC_SATURATION: "ctc-saturation/update",

  // --- Exchangeable Base Ratio Endpoints ---
  GET_BY_TABLE_EXCHANGEABLE_BASE_RATIO: "exchangeable-base-ratio/get-by-table",
  CREATE_EXCHANGEABLE_BASE_RATIO: "exchangeable-base-ratio/register",
  UPDATE_EXCHANGEABLE_BASE_RATIO: "exchangeable-base-ratio/update",

  // --- Recommended Limestone Type Endpoints ---
  GET_BY_TABLE_RECOMMENDED_LIMESTONE_TYPE: "recommended-limestone-type/get-by-table",
  CREATE_RECOMMENDED_LIMESTONE_TYPE: "recommended-limestone-type/register",
  UPDATE_RECOMMENDED_LIMESTONE_TYPE: "recommended-limestone-type/update",

  // --- Bio Fertilizer Endpoints ---
  DELETE_BIO_FERTILIZER: "bio-fertilizer/delete",
  GET_ALL_BIO_FERTILIZER: "bio-fertilizer/get-all",
  GET_ALL_DEFAULT_BIO_FERTILIZER: "bio-fertilizer/get-all-default",
  GET_ALL_PUBLIC_BIO_FERTILIZER: "bio-fertilizer/get-all-public",
  CREATE_BIO_FERTILIZER: "bio-fertilizer/register",
  UPDATE_BIO_FERTILIZER: "bio-fertilizer/update",

  // --- Chelated Fertilizer Endpoints ---
  DELETE_CHELATED_FERTILIZER: "chelated-fertilizer/delete",
  GET_ALL_CHELATED_FERTILIZER: "chelated-fertilizer/get-all",
  GET_ALL_DEFAULT_CHELATED_FERTILIZER: "chelated-fertilizer/get-all-default",
  GET_ALL_PUBLIC_CHELATED_FERTILIZER: "chelated-fertilizer/get-all-public",
  CREATE_CHELATED_FERTILIZER: "chelated-fertilizer/register",
  UPDATE_CHELATED_FERTILIZER: "chelated-fertilizer/update",
  
  // --- Exchangeable Sodium Endpoints ---
  GET_BY_TABLE_EXCHANGEABLE_SODIUM: "exchangeable-sodium/get-by-table",
  CREATE_EXCHANGEABLE_SODIUM: "exchangeable-sodium/register",
  UPDATE_EXCHANGEABLE_SODIUM: "exchangeable-sodium/update",

  // --- Content Range Endpoints ---
  DELETE_CONTENT_RANGE: "content-range/delete",
  GET_CONTENT_RANGE_BY_TABLE: "content-range/get-by-table",
  CREATE_CONTENT_RANGE: "content-range/register",
  REPLACE_BY_NUTRIENT_CONTENT_RANGE: "content-range/replace-by-nutrient",
  UPDATE_CONTENT_RANGE: "content-range/update",
  
  // --- Coverage Endpoints ---
  DELETE_COVERAGE: "coverage/delete",
  GET_COVERAGE_BY_RANGE: "coverage/get-by-range",
  CREATE_COVERAGE: "coverage/register",
  UPDATE_COVERAGE: "coverage/update",

  // --- Crop Deficiency Toxicity Endpoints ---
  DELETE_CROP_DEFICIENCY_TOXICITY: "crop-deficiency-toxicity/delete",
  GET_BY_CROP_CROP_DEFICIENCY_TOXICITY: "crop-deficiency-toxicity/get-by-crop",
  CREATE_CROP_DEFICIENCY_TOXICITY: "crop-deficiency-toxicity/register",
  UPDATE_CROP_DEFICIENCY_TOXICITY: "crop-deficiency-toxicity/update",
  DELETE_CROP_FERTILIZATION_TABLE: "crop-fertilization-table/delete",
  GET_CROP_FERTILIZATION_TABLE: "crop-fertilization-table/get",

  // --- Crop Fertilization Table Endpoints ---
  GET_CROP_FERTILIZATION_TABLE_ALL: "crop-fertilization-table/get-all",
  GET_CROP_FERTILIZATION_TABLE_ALL_DEFAULT: "crop-fertilization-table/get-all-default",
  GET_CROP_FERTILIZATION_TABLE_ALL_PUBLIC: "crop-fertilization-table/get-all-public",
  CREATE_CROP_FERTILIZATION_TABLE: "crop-fertilization-table/register",
  UPDATE_CROP_FERTILIZATION_TABLE: "crop-fertilization-table/update",
  CALCULATE_CROP_FERTILIZATION_TABLE_TEMPORARY_LIMING_CRITERION: "crop-fertilization-table/public/resolve-liming-criterion",

  // --- Crop Foliar Analysis Interpretation Table Endpoints ---
  DELETE_CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE_LINE: "crop-foliar-analysis-interpretation-table-line/delete",
  GET_BY_TABLE_CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE_LINE: "crop-foliar-analysis-interpretation-table-line/get-by-table",
  CREATE_CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE_LINE: "crop-foliar-analysis-interpretation-table-line/register",
  DELETE_CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE: "crop-foliar-analysis-interpretation-table/delete",
  GET_ALL_CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE: "crop-foliar-analysis-interpretation-table/get-all",
  GET_ALL_DEFAULT_CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE: "crop-foliar-analysis-interpretation-table/get-all-default",
  GET_ALL_PUBLIC_CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE: "crop-foliar-analysis-interpretation-table/get-all-public",
  CREATE_CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE: "crop-foliar-analysis-interpretation-table/register",
  UPDATE_CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE: "crop-foliar-analysis-interpretation-table/update",
  
  // --- Image Endpoints ---
  DELETE_IMAGE_MONGO: "delete",
  GET_IMAGE_MONGO: "get",
  UPDATE_IMAGE_MONGO: "update",
  UPLOAD_IMAGE_MONGO: "upload",
  GET_IMAGE_MONGO_BY_ID: "get-by-id",
  GET_IMAGE_MONGO_BY_NAME: "get-by-name",
  GET_IMAGE_MONGO_BY_PROPERTY: "get-by-property",
  GET_IMAGE_MONGO_BY_PLOT: "get-by-plot",
  GET_IMAGE_MONGO_BY_CROP: "get-by-crop",
  GET_IMAGE_MONGO_BY_FOLDER: "get-by-folder",
  GET_IMAGE_MONGO_BY_ANALYSIS: "get-by-analysis",
  GET_IMAGE_MONGO_BY_RECOMMENDATION: "get-by-recommendation",
  GET_IMAGE_MONGO_BY_FERTIGRAM: "get-by-fertigram",
  GET_IMAGE_MONGO_BY_FOLIAR_ANALYSIS: "get-by-foliar-analysis",
  GET_IMAGE_MONGO_BY_FOLIAR_FERTILIZATION: "get-by-foliar-fertilization",
  GET_IMAGE_MONGO_BY_SOIL_ANALYSIS: "get-by-soil-analysis",
  GET_IMAGE_MONGO_BY_SATURATION_EXTRACT_ANALYSIS_EXTRACT: "get-by-saturation-extract-analysis-extract",
  GET_IMAGE_MONGO_BY_PHYSICAL_ANALYSIS_EXTRACT: "get-by-physical-analysis-extract",
  GET_IMAGE_MONGO_BY_FERTILIZER: "get-by-fertilizer",

  // --- Diverse Content Range Endpoints ---
  GET_BY_TABLE_DIVERSE_CONTENT_RANGE: "diverse-content-range/get-by-table",
  CREATE_DIVERSE_CONTENT_RANGE: "diverse-content-range/register",
  UPDATE_DIVERSE_CONTENT_RANGE: "diverse-content-range/update",

  // --- Fertigram Endpoints ---
  GENERATE_FERTIGRAM: "fertigram/generate",

  // --- Fertility Analysis Extract Endpoints ---
  DELETE_FERTILITY_ANALYSIS_EXTRACT: "fertility-analysis-extract/delete",
  GET_BY_LAYER_FERTILITY_ANALYSIS_EXTRACT: "fertility-analysis-extract/get-by-layer",
  GET_BY_RANGE_FERTILITY_ANALYSIS_EXTRACT: "fertility-analysis-extract/get-by-range",
  GET_EXTRACT_FERTILITY_ANALYSIS_EXTRACT: "fertility-analysis-extract/get-extract",
  CREATE_FERTILITY_ANALYSIS_EXTRACT: "fertility-analysis-extract/register",
  UPDATE_FERTILITY_ANALYSIS_EXTRACT: "fertility-analysis-extract/update",
  
  // --- Foliar Analysis Endpoints ---
  DELETE_FOLIAR_ANALYSIS: "foliar-analysis/delete",
  GET_FOLIAR_ANALYSIS: "foliar-analysis/get",
  GET_BY_CROP_FOLIAR_ANALYSIS: "foliar-analysis/get-by-crop",
  CREATE_FOLIAR_ANALYSIS: "foliar-analysis/register",
  UPDATE_FOLIAR_ANALYSIS: "foliar-analysis/update",
  
  // --- Foliar Fertilization Endpoints ---
  DELETE_FOLIAR_FERTILIZATION_LIQUID_SOURCE: "foliar-fertilization/liquid-source/delete",
  GET_FOLIAR_FERTILIZATION_LIQUID_SOURCE: "foliar-fertilization/liquid-source/get",
  GET_BY_CROP_FOLIAR_FERTILIZATION_LIQUID_SOURCE: "foliar-fertilization/liquid-source/get-by-crop",
  CREATE_FOLIAR_FERTILIZATION_LIQUID_SOURCE: "foliar-fertilization/liquid-source/register",
  UPDATE_FOLIAR_FERTILIZATION_LIQUID_SOURCE: "foliar-fertilization/liquid-source/update",
  DELETE_FOLIAR_FERTILIZATION_SOLID_SOURCE: "foliar-fertilization/solid-source/delete",
  GET_FOLIAR_FERTILIZATION_SOLID_SOURCE: "foliar-fertilization/solid-source/get",
  GET_BY_CROP_FOLIAR_FERTILIZATION_SOLID_SOURCE: "foliar-fertilization/solid-source/get-by-crop",
  CREATE_FOLIAR_FERTILIZATION_SOLID_SOURCE: "foliar-fertilization/solid-source/register",
  UPDATE_FOLIAR_FERTILIZATION_SOLID_SOURCE: "foliar-fertilization/solid-source/update",
  
  // --- Formulated Mineral Fertilizer Endpoints ---
  DELETE_FORMULATED_MINERAL_FERTILIZER: "formulated-mineral-fertilizer/delete",
  GET_ALL_FORMULATED_MINERAL_FERTILIZER: "formulated-mineral-fertilizer/get-all",
  GET_ALL_DEFAULT_FORMULATED_MINERAL_FERTILIZER: "formulated-mineral-fertilizer/get-all-default",
  GET_ALL_PUBLIC_FORMULATED_MINERAL_FERTILIZER: "formulated-mineral-fertilizer/get-all-public",
  CREATE_FORMULATED_MINERAL_FERTILIZER: "formulated-mineral-fertilizer/register",
  UPDATE_FORMULATED_MINERAL_FERTILIZER: "formulated-mineral-fertilizer/update",

  // --- Green Fertilizer Endpoints ---
  DELETE_GREEN_FERTILIZER: "green-fertilizer/delete",
  GET_ALL_GREEN_FERTILIZER: "green-fertilizer/get-all",
  GET_ALL_DEFAULT_GREEN_FERTILIZER: "green-fertilizer/get-all-default",
  GET_ALL_PUBLIC_GREEN_FERTILIZER: "green-fertilizer/get-all-public",
  CREATE_GREEN_FERTILIZER: "green-fertilizer/register",
  UPDATE_GREEN_FERTILIZER: "green-fertilizer/update",
  
  // --- Layer Extract Endpoints ---
  DELETE_LAYER_EXTRACT: "layer-extract/delete",
  GET_BY_ANALYSIS_LAYER_EXTRACT: "layer-extract/get-by-analysis",
  GET_LAYER_EXTRACT_LAYER_EXTRACT: "layer-extract/get-layer-extract",
  CREATE_LAYER_EXTRACT: "layer-extract/register",
  UPDATE_LAYER_EXTRACT: "layer-extract/update",
  
  // --- Mineral Fertilizer Endpoints ---
  DELETE_MINERAL_FERTILIZER: "mineral-fertilizer/delete",
  GET_ALL_MINERAL_FERTILIZER: "mineral-fertilizer/get-all",
  GET_ALL_DEFAULT_MINERAL_FERTILIZER: "mineral-fertilizer/get-all-default",
  GET_ALL_PUBLIC_MINERAL_FERTILIZER: "mineral-fertilizer/get-all-public",
  CREATE_MINERAL_FERTILIZER: "mineral-fertilizer/register",
  UPDATE_MINERAL_FERTILIZER: "mineral-fertilizer/update",
  DELETE_ORGANIC_FERTILIZER: "organic-fertilizer/delete",
  
  // --- Organic Fertilizer Endpoints ---
  GET_ALL_ORGANIC_FERTILIZER: "organic-fertilizer/get-all",
  GET_ALL_DEFAULT_ORGANIC_FERTILIZER: "organic-fertilizer/get-all-default",
  GET_ALL_PUBLIC_ORGANIC_FERTILIZER: "organic-fertilizer/get-all-public",
  CREATE_ORGANIC_FERTILIZER: "organic-fertilizer/register",
  UPDATE_ORGANIC_FERTILIZER: "organic-fertilizer/update",
  
  // --- Organo-Mineral Fertilizer Endpoints ---
  DELETE_ORGANO_MINERAL_FERTILIZER: "organo-mineral-fertilizer/delete",
  GET_ALL_ORGANO_MINERAL_FERTILIZER: "organo-mineral-fertilizer/get-all",
  GET_ALL_DEFAULT_ORGANO_MINERAL_FERTILIZER: "organo-mineral-fertilizer/get-all-default",
  GET_ALL_PUBLIC_ORGANO_MINERAL_FERTILIZER: "organo-mineral-fertilizer/get-all-public",
  CREATE_ORGANO_MINERAL_FERTILIZER: "organo-mineral-fertilizer/register",
  UPDATE_ORGANO_MINERAL_FERTILIZER: "organo-mineral-fertilizer/update",
  
  // --- Physical Analysis Extract Endpoints ---
  DELETE_PHYSICAL_ANALYSIS_EXTRACT: "physical-analysis-extract/delete",
  GET_PHYSICAL_ANALYSIS_EXTRACT: "physical-analysis-extract/get",
  GET_BY_LAYER_PHYSICAL_ANALYSIS_EXTRACT: "physical-analysis-extract/get-by-layer",
  GET_BY_RANGE_PHYSICAL_ANALYSIS_EXTRACT: "physical-analysis-extract/get-by-range",
  CREATE_PHYSICAL_ANALYSIS_EXTRACT: "physical-analysis-extract/register",
  UPDATE_PHYSICAL_ANALYSIS_EXTRACT: "physical-analysis-extract/update",
  
  // --- Range Extract Endpoints ---
  DELETE_RANGE_EXTRACT: "range-extract/delete",
  GET_BY_ANALYSIS_RANGE_EXTRACT: "range-extract/get-by-analysis",
  GET_RANGE_EXTRACT_RANGE_EXTRACT: "range-extract/get-range-extract",
  CREATE_RANGE_EXTRACT: "range-extract/register",
  UPDATE_RANGE_EXTRACT: "range-extract/update",
  
  // --- Recommendation Endpoints ---
  DELETE_RECOMMENDATION: "recommendation/delete",
  GENERATE_RECOMMENDATION: "recommendation/generate",
  GET_RECOMMENDATION: "recommendation/get",
  IMPROVE_NARRATIVE_RECOMMENDATION: "recommendation/improve-narrative",
  GET_MY_RECOMMENDATION: "recommendation/my",
  GET_BY_PLOT_RECOMMENDATION: "recommendation/plot",
  PREPARE_PRINT_RECOMMENDATION: "recommendation/print",
  GET_BY_PROPERTY_RECOMMENDATION: "recommendation/property",
  GET_SUMMARY_RECOMMENDATION_BY_RECOMMENDATION: "summary-recommendation/get-by-recommendation",
  GET_DIRECT_RECOMMENDATION_BY_RECOMMENDATION: "direct-recommendation/get-by-recommendation",
  GET_SHOPPING_LIST_BY_RECOMMENDATION: "shopping-list/get-by-recommendation",
  
  // --- Salinity Interpretation Endpoints ---
  GET_BY_TABLE_SALINITY_INTERPRETATION: "salinity-interpretation/get-by-table",
  CREATE_SALINITY_INTERPRETATION: "salinity-interpretation/register",
  UPDATE_SALINITY_INTERPRETATION: "salinity-interpretation/update",
  
  // --- Saturation Extract Analysis Extract Endpoints ---
  DELETE_SATURATION_EXTRACT_ANALYSIS_EXTRACT: "saturation-extract-analysis-extract/delete",
  GET_BY_LAYER_SATURATION_EXTRACT_ANALYSIS_EXTRACT: "saturation-extract-analysis-extract/get-by-layer",
  GET_BY_RANGE_SATURATION_EXTRACT_ANALYSIS_EXTRACT: "saturation-extract-analysis-extract/get-by-range",
  GET_EXTRACT_SATURATION_EXTRACT_ANALYSIS_EXTRACT: "saturation-extract-analysis-extract/get-extract",
  CREATE_SATURATION_EXTRACT_ANALYSIS_EXTRACT: "saturation-extract-analysis-extract/register",
  UPDATE_SATURATION_EXTRACT_ANALYSIS_EXTRACT: "saturation-extract-analysis-extract/update",
  
  // --- Simple Mineral Fertilizer Endpoints ---
  DELETE_SIMPLE_MINERAL_FERTILIZER: "simple-mineral-fertilizer/delete",
  GET_ALL_SIMPLE_MINERAL_FERTILIZER: "simple-mineral-fertilizer/get-all",
  GET_ALL_DEFAULT_SIMPLE_MINERAL_FERTILIZER: "simple-mineral-fertilizer/get-all-default",
  GET_ALL_PUBLIC_SIMPLE_MINERAL_FERTILIZER: "simple-mineral-fertilizer/get-all-public",
  CREATE_SIMPLE_MINERAL_FERTILIZER: "simple-mineral-fertilizer/register",
  UPDATE_SIMPLE_MINERAL_FERTILIZER: "simple-mineral-fertilizer/update",
  
  // --- Soil Analysis Endpoints ---
  DELETE_SOIL_ANALYSIS: "soil-analysis/delete",
  GET_BY_PLOT_SOIL_ANALYSIS: "soil-analysis/get-by-plot",
  GET_SOIL_ANALYSIS_SOIL_ANALYSIS: "soil-analysis/get-soil-analysis",
  CREATE_SOIL_ANALYSIS: "soil-analysis/register",
  UPDATE_SOIL_ANALYSIS: "soil-analysis/update",
  
  // --- Soil Fertility Interpretation Criteria Table Endpoints ---
  DELETE_SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE: "soil-fertility-interpretation-criteria-table/delete",
  GET_ALL_SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE: "soil-fertility-interpretation-criteria-table/get-all",
  GET_ALL_DEFAULT_SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE: "soil-fertility-interpretation-criteria-table/get-all-default",
  GET_ALL_PUBLIC_SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE: "soil-fertility-interpretation-criteria-table/get-all-public",
  CREATE_SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE: "soil-fertility-interpretation-criteria-table/register",
  UPDATE_SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE: "soil-fertility-interpretation-criteria-table/update",
  
  // --- Top Dressing Fertilization Endpoints ---
  DELETE_TOP_DRESSING_FERTILIZATION: "top-dressing-fertilization/delete",
  GET_BY_CROP_TOP_DRESSING_FERTILIZATION: "top-dressing-fertilization/get-by-crop",
  CREATE_TOP_DRESSING_FERTILIZATION: "top-dressing-fertilization/register",
  UPDATE_TOP_DRESSING_FERTILIZATION: "top-dressing-fertilization/update",

} as const;
