const HEADER = {
    API_KEY: "x-api-key",
    CLIENT_ID: "x-client-id",
    AUTHORIZATION: "authorization",
    REFRESH_TOKEN: "x-rtoken-id",
};

const StatusCode = {
    FORBIDDEN: 403,
    CONFLICT: 409,
    OK: 200,
    CREATED: 201,
};

const ReasonStatusCode = {
    FORBIDDEN: "Bad request error",
    CONFLICT: "Conflict error",
    OK: "Success",
    CREATED: "Created!",
};

const RoleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
};

module.exports = {
    HEADER,
    StatusCode,
    ReasonStatusCode,
    RoleShop,
};