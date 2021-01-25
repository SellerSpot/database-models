// all models created in all databases should be listed here, if needed introduce nested object for isolation, (make sure not to introduce more than one level of nested objects)
const MONGOOSE_MODELS = {
    BASE_DB: {
        TENANT: 'TENANT',
        SUB_DOMAIN: 'SUB_DOMAIN',
        APP: 'APP',
        PLUGIN: 'PLUGIN',
        RESERVED_DOMAIN: 'RESERVED_DOMAIN',
    },
    TENANT_DB: {
        // billing model needs to added once confirmed
        TENANT_HANDSHAKE: 'TENANT_HANDSHAKE',
        INSTAllED_APP: 'INSTAllED_APP',
        // point of sale models
        POINT_OF_SALE: {
            BASE: 'BASE',
            PRODUCT: 'PRODUCT',
            TAXBRACKET: 'TAXBRACKET',
            SALE: 'SALE',
            BRAND: 'BRAND',
            CATEGORY: 'CATEGORY',
            STOCKUNIT: 'STOCKUNIT',
        },
    },
    APP_DB: {
        DETAIL: 'DETAIL',
        INSTALLED_TENANT: 'INSTALLED_TENANT',
        // features model needs to be added as per requirement
    },
};

export default MONGOOSE_MODELS;
