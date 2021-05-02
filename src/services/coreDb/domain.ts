import { BadRequestError, logger } from '@sellerspot/universal-functions';
import { ERROR_CODE } from '@sellerspot/universal-types';
import { DbConnectionManager } from '../../configs/initializer';
import { MONGOOSE_MODELS } from '../../models';
import { IDomain } from '../../models/coreDb/Domain';

export const createDomain = async ({
    domainName,
    tenantId,
    isCustom = false,
    isReserved = false,
}: {
    domainName: string;
    tenantId: string;
    isReserved?: boolean;
    isCustom?: boolean;
}): Promise<IDomain> => {
    const conn = DbConnectionManager.getCoreDb();
    const Domain = conn.model<IDomain>(MONGOOSE_MODELS.CORE_DB.DOMAIN);
    if (!checkDomainAvailability(domainName)) {
        logger.error(`Tenant invalid - domain already exist ${domainName}`);
        throw new BadRequestError(ERROR_CODE.TENANT_INVALID, 'Domain already exist');
    }
    const domain = await Domain.create({
        name: domainName,
        tenant: tenantId,
        isReserved,
        isCustom,
    });
    logger.info(`Tenant ${tenantId} has been mapped to ${domainName}.`);
    return domain;
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

export const getDomainByTenantId = async (tenantId: string): Promise<IDomain> => {
    const conn = DbConnectionManager.getCoreDb();
    const Domain = conn.model<IDomain>(MONGOOSE_MODELS.CORE_DB.DOMAIN);
    const domain = await Domain.findOne({ tenant: tenantId });
    return domain;
};

export const getDomainByName = async (domainName: string): Promise<IDomain> => {
    const conn = DbConnectionManager.getCoreDb();
    const Domain = conn.model<IDomain>(MONGOOSE_MODELS.CORE_DB.DOMAIN);
    const domain = await Domain.findOne({ name: domainName });
    return domain;
};
