// database models exports
export * as baseDbModels from 'models/baseDb';
export * as tenantDbModels from 'models/tenantDb';
export * as appDbModels from 'models/appDb';

// all models created in all databases should be listed here, if needed introduce nested object for isolation, (make sure not to introduce more than one level of nested objects)
export const MONGOOSE_MODELS = {
    BASE_DB: {
        TENANT: 'TENANT',
        SUB_DOMAIN: 'SUB_DOMAIN',
        APP: 'APP',
        PLUGIN: 'PLUGIN',
        RESERVED_DOMAIN: 'RESERVED_DOMAIN',
    },
    TENANT_DB: {
        TENANT_HANDSHAKE: 'TENANT_HANDSHAKE',
        INSTAllED_APP: 'INSTAllED_APP',
        // billing model needs to added once confirmed
    },
    APP_DB: {
        DETAIL: 'DETAIL',
        INSTALLED_TENANT: 'INSTALLED_TENANT',
        // features model needs to be added as per requirement
    },
};
