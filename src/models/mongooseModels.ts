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
            
        },
        ECOMMERCE: {
            // ecommerce collections goes here
        },
        CATALOGUE: {
            // catalogue collections goes here
            // point of sale collections goes here
            CATALOGUE_PRODUCT: 'PRODUCT',
            CATALOGUE_STOCKUNIT: 'STOCKUNIT',
            CATALOGUE_CATEGORY: 'CATEGORY',
            CATALOGUE_BRAND: 'BRAND',
            CATALOGUE_TAXBRACKET: 'TAXBRACKET',
            CATALOGUE_TAXGROUP: 'TAXGROUP',
            CATALOGUE_OUTLET: 'OUTLET',
            CATALOGUE_EMPLOYEE: 'EMPLOYEE',
        },
    },
};

export default MONGOOSE_MODELS;
