export const ENDPOINT = {

    // User Endpoints:
    ME: "me",
    SIGN_IN: "authentication/authenticate",
    CREATE_NEW_USER: "user/register",
    UPDATE_USER: "user/update",
    GET_USER: "user/get",
    DELETE_USER: "user/delete",

    // Property Endpoints:
    PROPERTY_BASE: "property",
    CREATE_PROPERTY: "property/register",
    GET_PROPERTY_BY_ID: "property/get",
    GET_MY_PROPERTIES: "property/get-my-properties",
    UPDATE_PROPERTY: "property/update",
    DELETE_PROPERTY: "property/delete",
    SEARCH_PROPERTIES: "property/search",
    GET_MANAGEABLE_PROPERTIES: "property/get-manageable-properties",

    // Property Access Request Endpoints:
    PROPERTY_ACCESS_REQUEST_BASE: "property-access",
    CREATE_PROPERTY_ACCESS_REQUEST: "property-access/request",
    GET_REQUESTS_FOR_PROPERTY: "property-access/requests",
    DECIDE_REQUEST: "property-access/{requestedId}/decision",
    GET_APPROVED_REQUESTS_BY_USER: "property-access/my-approved-properties",

    // --- Crop Fertilization Table Endpoints ---
    CROP_TABLE_BASE: "crop-fertilization-table",
    CREATE_CROP_TABLE: "crop-fertilization-table/register",
    GET_ALL_CROP_TABLES: "crop-fertilization-table/get-all",
    GET_CROP_TABLE_BY_ID: "crop-fertilization-table/get",
    UPDATE_CROP_TABLE: "crop-fertilization-table/update",
    DELETE_CROP_TABLE: "crop-fertilization-table/delete",

    // --- Content Range Endpoints ---
    CONTENT_RANGE_BASE: "content-range",
    CREATE_CONTENT_RANGE: "content-range/register",
    GET_CONTENT_RANGES_BY_TABLE: "content-range/get-by-table",
    UPDATE_CONTENT_RANGE: "content-range/update",
    DELETE_CONTENT_RANGE: "content-range/delete",

    // --- Coverage Endpoints ---
    COVERAGE_BASE: "coverage",
    CREATE_COVERAGE: "coverage/register",
    GET_COVERAGES_BY_RANGE: "coverage/get-by-range",
    UPDATE_COVERAGE: "coverage/update",
    DELETE_COVERAGE: "coverage/delete",


    // Centralized service base routes:
    USER: "/user",
    PROPERTY: "/property",
    PLOT: "/plot",
    CROP: "/crop",
    ANNUAL_CROP_FOLDER: "/annual-crop-folder",
    PROPERTY_ACCESS: "/property-access",
    PLOT_ACCESS: "/plot-access",
    SOIL_ANALYSIS: "/soil-analysis",
    CROP_FERTILIZATION_TABLE: "/crop-fertilization-table",
    CONTENT_RANGE: "/content-range",
    COVERAGE: "/coverage",
    RECOMMENDATION: "/recommendation",
    RANGE_EXTRACT: "/range-extract",
    LAYER_EXTRACT: "/layer-extract",
    FERTILITY_ANALYSIS_EXTRACT: "/fertility-analysis-extract",
    PHYSICAL_ANALYSIS_EXTRACT: "/physical-analysis-extract",
    SATURATION_EXTRACT_ANALYSIS_EXTRACT: "/saturation-extract-analysis-extract",
    AVAILABLE_S: "/available-s",
    AVAILABLE_P_MEHLICH_1: "/available-p-mehlich-1-extractor",
    AVAILABLE_P_RESIN: "/available-p-anion-exchange-resin-extractor",
    K_EXCHANGEABLE_CONTENT: "/k-exchangeable-content",
    DIVERSE_CONTENT_RANGE: "/diverse-content-range",
    SALINITY_INTERPRETATION: "/salinity-interpretation",
    SOIL_FERTILITY_INTERPRETATION_CRITERIA_TABLE: "/soil-fertility-interpretation-criteria-table",
    MINERAL_FERTILIZER: "/mineral-fertilizer",
    SIMPLE_MINERAL_FERTILIZER: "/simple-mineral-fertilizer",
    FORMULATED_MINERAL_FERTILIZER: "/formulated-mineral-fertilizer",
    ORGANIC_FERTILIZER: "/organic-fertilizer",
    ORGANO_MINERAL_FERTILIZER: "/organo-mineral-fertilizer",
    BIO_FERTILIZER: "/bio-fertilizer",
    CHELATED_FERTILIZER: "/chelated-fertilizer",
    GREEN_FERTILIZER: "/green-fertilizer",
    FERTIGRAM: "/fertigram",
    FOLIAR_ANALYSIS: "/foliar-analysis",
    FOLIAR_FERTILIZATION_SOLID_SOURCE: "/foliar-fertilization/solid-source",
    FOLIAR_FERTILIZATION_LIQUID_SOURCE: "/foliar-fertilization/liquid-source",
    TOP_DRESSING_FERTILIZATION: "/top-dressing-fertilization",
    CROP_DEFICIENCY_TOXICITY: "/crop-deficiency-toxicity",
    CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE: "/crop-foliar-analysis-interpretation-table",
    CROP_FOLIAR_ANALYSIS_INTERPRETATION_TABLE_LINE: "/crop-foliar-analysis-interpretation-table-line",

    // --- Image manager endpoints ---
    GET_IMAGE_MONGO: "get",
    UPLOAD_IMAGE_MONGO: "upload",
    DELETE_IMAGE_MONGO: "delete",
    UPDATE_IMAGE_MONGO: "update"

} as const;
