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

    // Property Access Request Endpoints:
    PROPERTY_ACCESS_REQUEST_BASE: "property-access",
    CREATE_PROPERTY_ACCESS_REQUEST: "property-access/request",
    GET_REQUESTS_FOR_PROPERTY: "property-access/requests",
    DECIDE_REQUEST: "property-access/{requestedId}/decision",
    GET_APPROVED_REQUESTS_BY_USER: "property-access/my-approved-properties",

} as const;