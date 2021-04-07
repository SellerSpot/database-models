import { authTypes, ERROR_CODE } from '@sellerspot/universal-types';
import { ITenant } from '../../models/coreDb/Tenant';
import { IDomain } from '../../models/coreDb/Domain';
import { logger, error } from '@sellerspot/universal-functions';
import { dbs } from '../../config/initializer';
import { MONGOOSE_MODELS } from '../../';

/**
 * creates a tenant if necessary props are passed
 *
 * @returns document of the created tenant
 */
export const createTenant = async (
    tenantDetails: authTypes.authRequestTypes.ISignupTenantRequest,
): Promise<Partial<ITenant>> => {
    const { name, email, password, domainName, storeName } = tenantDetails;
    const Tenant = dbs.core.model<ITenant>(MONGOOSE_MODELS.CORE_DB.TENANT);
    const existingTenant = await Tenant.findOne({ email });
    if (existingTenant) {
        logger.info(`Tenant invalid - tenant with same email already exist`);
        throw new error.BadRequestError(ERROR_CODE.TENANT_INVALID, 'Auth error');
    }
    const Domain = dbs.core.model<IDomain>(MONGOOSE_MODELS.CORE_DB.DOMAIN);
    const existingDomain = await Domain.findOne({ name: domainName });
    if (existingDomain) {
        logger.info(`Tenant invalid - domain already exist`);
        throw new error.BadRequestError(ERROR_CODE.TENANT_INVALID, 'Domain already exist');
    }
    const tenant = await Tenant.create({ name, email, password, storeName });
    await tenant.save();
    const domain = await Domain.create({ name: domainName, tenant: tenant?.id });
    await domain.save();
    logger.info(`Tenant registered successfully ${email} - ${tenant.id}`);
    return tenant.toJSON() as ITenant;
};
