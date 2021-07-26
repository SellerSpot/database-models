// all models created in all databases should be listed here, if needed introduce nested object for isolation, (make sure not to introduce more than one level of nested objects)
export const MONGOOSE_MODELS = {
    CORE_DB: {
        TENANT: 'TENANT',
        CUSTOMER: 'CUSTOMER',
        DOMAIN: 'DOMAIN',
        PLUGIN: 'PLUGIN',
        STORE_CURRENCY: 'STORE_CURRENCY',
    },
    TENANT_DB: {
        // billing model needs to added once confirmed
        USER: 'USER',
        // point of sale models
        POINT_OF_SALE: {
            // point of sale collections goes here
            INVENTORY: 'POINT_OF_SALE_INVENTORY',
            SALE: 'POINT_OF_SALE_SALE',
            OUTLET: 'POINT_OF_SALE_OUTLET',
        },
        ECOMMERCE: {
            // ecommerce collections goes here
        },
        CATALOGUE: {
            // catalogue collections goes here
            PRODUCT: 'CATALOGUE_PRODUCT',
            STOCKUNIT: 'CATALOGUE_STOCKUNIT',
            CATEGORY: 'CATALOGUE_CATEGORY',
            BRAND: 'CATALOGUE_BRAND',
            TAXSETTING: 'CATALOGUE_TAXSETTING',
        },
    },
};
