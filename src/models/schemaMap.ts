import { Schema } from 'mongoose';
// import { MONGOOSE_MODELS } from './';
// import { CustomerSchema, DomainSchema, TenantSchema, PluginSchema } from './coreDb';
// import { UserSchema } from './tenantDb';
// import { CategorySchema } from './tenantDb/catalogueModels';

// export const MODEL_NAME_VS_SCHEMA = {
//     [MONGOOSE_MODELS.CORE_DB.CUSTOMER]: CustomerSchema,
//     [MONGOOSE_MODELS.CORE_DB.DOMAIN]: DomainSchema,
//     [MONGOOSE_MODELS.CORE_DB.PLUGIN]: PluginSchema,
//     [MONGOOSE_MODELS.CORE_DB.TENANT]: TenantSchema,
//     [MONGOOSE_MODELS.TENANT_DB.USER]: UserSchema,
//     [MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY]: CategorySchema,
// };

export const MODEL_NAME_VS_SCHEMA = new Map<string, Schema>();
