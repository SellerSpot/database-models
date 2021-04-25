import { BadRequestError, logger } from '@sellerspot/universal-functions';
import { ERROR_CODE } from '@sellerspot/universal-types';
import { LeanDocument } from 'mongoose';
import { DbConnectionManager } from '../../config/initializer';
import { MONGOOSE_MODELS } from '../../model';
import { IDomain } from '../../model/coreDb/Domain';

export const createDomain = async (
    domainName: string,
    tenantId: string,
): Promise<LeanDocument<IDomain>> => {
    const conn = DbConnectionManager.getCoreDb();
    const Domain = conn.model<IDomain>(MONGOOSE_MODELS.CORE_DB.DOMAIN);
    if (!checkDomainAvailability(domainName)) {
        logger.error(`Tenant invalid - domain already exist ${domainName}`);
        throw new BadRequestError(ERROR_CODE.TENANT_INVALID, 'Domain already exist');
    }
    const domain = await Domain.create({ name: domainName, tenant: tenantId });
    logger.info(`Tenant ${tenantId} has been mapped to ${domainName}.`);
    return domain.toJSON();
};

export const checkDomainAvailability = async (domainName: string): Promise<boolean> => {
    const conn = DbConnectionManager.getCoreDb();
    const Domain = conn.model<IDomain>(MONGOOSE_MODELS.CORE_DB.DOMAIN);
    const existingDomain = await Domain.findOne({ name: domainName });
    if (existingDomain) {
        return false;
    }
    return true;
};

export const getDomainByTenantId = async (tenantId: string): Promise<LeanDocument<IDomain>> => {
    const conn = DbConnectionManager.getCoreDb();
    const Domain = conn.model<IDomain>(MONGOOSE_MODELS.CORE_DB.DOMAIN);
    const domain = await Domain.findOne({ tenant: tenantId });
    return domain.toJSON();
};

export const getDomainByName = async (domainName: string): Promise<LeanDocument<IDomain>> => {
    const conn = DbConnectionManager.getCoreDb();
    const Domain = conn.model<IDomain>(MONGOOSE_MODELS.CORE_DB.DOMAIN);
    const domain = await Domain.findOne({ name: domainName });
    return domain.toJSON();
};
