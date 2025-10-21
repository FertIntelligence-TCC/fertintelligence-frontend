export const ENDPOINT = {
    ME: "me",
    SIGN_IN: "authentication/authenticate",
    CREATE_NEW_USER: "user/register",
    UPDATE_USER: "user/update",
    GET_USER: "user/get",
    DELETE_USER: "user/delete",

    // Property Endpoints (Estilo Grimoire)
    PROPERTY_BASE: "property",
    CREATE_PROPERTY: "property/register",
    GET_PROPERTY_BY_ID: "property/get",
    GET_MY_PROPERTIES: "property/get-my-properties",
    UPDATE_PROPERTY: "property/update",
    DELETE_PROPERTY: "property/delete",

} as const;