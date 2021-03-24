// all models created in all databases should be listed here, if needed introduce nested object for isolation, (make sure not to introduce more than one level of nested objects)
const MONGOOSE_MODELS = {
    BASE_DB: {
        TENANT: 'TENANT',
        CUSTOMER: 'CUSTOMER',
        DOMAIN: 'DOMAIN',
        PLUGIN: 'PLUGIN',
    },
    TENANT_DB: {
        // billing model needs to added once confirmed
        TENANT_HANDSHAKE: 'TENANT_HANDSHAKE',
        // point of sale models
        POINT_OF_SALE: {
            // point of sale collections goes here
            POINT_OF_SALE_PRODUCT: 'PRODUCT',
            POINT_OF_SALE_STOCKUNIT: 'STOCKUNIT',
            POINT_OF_SALE_CATEGORY: 'CATEGORY',
            POINT_OF_SALE_BRAND: 'BRAND',
        },
        ECOMMERCE: {
            // ecommerce collections goes here
        },
        CATALOGUE: {
            // catalogue collections goes here
        },
    },
};

export default MONGOOSE_MODELS;
