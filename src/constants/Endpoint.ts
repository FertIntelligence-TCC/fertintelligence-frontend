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

    // --- Image manager endpoints ---
    GET_IMAGE_MONGO: "get",
    UPLOAD_IMAGE_MONGO: "upload",
    DELETE_IMAGE_MONGO: "delete",
    UPDATE_IMAGE_MONGO: "update"

} as const;