import { ITenant } from '../../models/coreDb/Tenant';
import { DbConnectionManager } from '../../config/initializer';
import { MONGOOSE_MODELS } from '../../';
import { logger, error } from '@sellerspot/universal-functions';
import { ERROR_CODE } from '@sellerspot/universal-types';
import { LeanDocument } from 'mongoose';

type TTenantAttrs = Pick<ITenant, 'email' | 'name' | 'password' | 'storeName'>;

export const createTenant = async (tenantDetails: TTenantAttrs): Promise<LeanDocument<ITenant>> => {
    const conn = DbConnectionManager.getCoreDb();
    const { name, email, password, storeName } = tenantDetails;
    const Tenant = conn.model<ITenant>(MONGOOSE_MODELS.CORE_DB.TENANT);
    const existingTenant = await Tenant.findOne({ email });
    if (existingTenant) {
        logger.error(`Tenant with that email ${email} exist`);
        throw new error.BadRequestError(
            ERROR_CODE.TENANT_NOT_CREATED,
            `Tenant with email ${email} already exist.`,
        );
    }
    const tenant = await Tenant.create({ name, email, password, storeName });
    logger.info(`Tenant registered successfully ${email} - ${tenant.id}`);
    return tenant.toJSON();
};

export const getTenantById = async (tenantId: string): Promise<LeanDocument<ITenant>> => {
    const conn = DbConnectionManager.getCoreDb();
    const Tenant = conn.model<ITenant>(MONGOOSE_MODELS.CORE_DB.TENANT);
    const tenant = await Tenant.findById({ tenantId });
    return tenant.toJSON();
};

export const getTenantByEmail = async (email: string): Promise<LeanDocument<ITenant>> => {
    const conn = DbConnectionManager.getCoreDb();
    const Tenant = conn.model<ITenant>(MONGOOSE_MODELS.CORE_DB.TENANT);
    const tenant = await Tenant.findById({ email });
    return tenant.toJSON();
};
