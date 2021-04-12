import { ITenant } from '../../models/coreDb/Tenant';
import { ITenantHandshake } from '../../models/tenantDb/TenantHandshake';
import { dbs } from '../../config/initializer';
import { MONGOOSE_MODELS } from '../../';
import { tenantWrapper } from '../../config/initializer';
import { logger, error } from '@sellerspot/universal-functions';
import { ERROR_CODE } from '@sellerspot/universal-types';
import { LeanDocument } from 'mongoose';

type TTenantAttrs = Pick<ITenant, 'email' | 'name' | 'password' | 'storeName'>;

/**
 * creates a tenant if necessary props are passed
 * @param {TTenantAttrs} tenantDetails - tenant details
 * @returns {Promise<LeanDocument<ITenant>>} lean document of the created tenant
 */
export const createTenant = async (tenantDetails: TTenantAttrs): Promise<LeanDocument<ITenant>> => {
    const { name, email, password, storeName } = tenantDetails;
    const Tenant = dbs.core.model<ITenant>(MONGOOSE_MODELS.CORE_DB.TENANT);
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
    setTimeout(async () => {
        const tenantHandsake = await createTenantHandsake(tenant.id, tenant);
        logger.info(`Tenant Handsake created in scoped db with id ${tenantHandsake.id}`);
    }, 0);
    return tenant.toJSON();
};

export const getTenantById = async (tenantId: string): Promise<ITenant> => {
    const Tenant = dbs.core.model<ITenant>(MONGOOSE_MODELS.CORE_DB.TENANT);
    const tenant = await Tenant.findById({ tenantId });
    return tenant;
};

export const getTenantByEmail = async (email: string): Promise<ITenant> => {
    const Tenant = dbs.core.model<ITenant>(MONGOOSE_MODELS.CORE_DB.TENANT);
    const tenant = await Tenant.findById({ email });
    return tenant;
};

export const createTenantHandsake = tenantWrapper(
    async (tenant: ITenant): Promise<LeanDocument<ITenantHandshake>> => {
        const TenantHandshake = dbs.tenant.model<ITenantHandshake>(
            MONGOOSE_MODELS.TENANT_DB.TENANT_HANDSHAKE,
        );
        const tenantHandsake: ITenantHandshake = await TenantHandshake.create({
            name: tenant.name,
            email: tenant.email,
            storeName: tenant.storeName,
            tenant: tenant.id,
        });
        return tenantHandsake.toJSON();
    },
);
