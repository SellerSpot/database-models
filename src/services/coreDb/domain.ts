import { IDomain } from '../../models/coreDb/Domain';
import { logger, error } from '@sellerspot/universal-functions';
import { ERROR_CODE } from '@sellerspot/universal-types';
import { dbs } from '../../config/initializer';
import { MONGOOSE_MODELS } from '../../';

/**
 * creates a domain if necessary props
 * @param {string} domainName
 * @param {string} tenantId
 * @returns {Promise<LeanDocument<IDomain>>} lean document of the created domain
 */
export const createDomain = async (domainName: string, tenantId: string): Promise<IDomain> => {
    const Domain = dbs.core.model<IDomain>(MONGOOSE_MODELS.CORE_DB.DOMAIN);
    if (!checkDomainAvailability(domainName)) {
        logger.error(`Tenant invalid - domain already exist ${domainName}`);
        throw new error.BadRequestError(ERROR_CODE.TENANT_INVALID, 'Domain already exist');
    }
    const domain = await Domain.create({ name: domainName, tenant: tenantId });
    logger.info(`Tenant ${tenantId} has been mapped to ${domainName}.`);
    return domain;
};

export const checkDomainAvailability = async (domainName: string): Promise<boolean> => {
    const Domain = dbs.core.model<IDomain>(MONGOOSE_MODELS.CORE_DB.DOMAIN);
    const existingDomain = await Domain.findOne({ name: domainName });
    if (existingDomain) {
        return false;
    }
    return true;
};

export const getDomainByTenantId = async (tenantId: string): Promise<IDomain> => {
    const Domain = dbs.core.model<IDomain>(MONGOOSE_MODELS.CORE_DB.DOMAIN);
    const domain = await Domain.findOne({ tenant: tenantId });
    return domain;
};

export const getDomainByName = async (domainName: string): Promise<IDomain> => {
    const Domain = dbs.core.model<IDomain>(MONGOOSE_MODELS.CORE_DB.DOMAIN);
    const domain = await Domain.findOne({ name: domainName });
    return domain;
};
