import { AuthUtil, BadRequestError, logger } from '@sellerspot/universal-functions';
import { ERROR_CODE } from '@sellerspot/universal-types';
import { DbConnectionManager } from '../../configs/DbConnectionManager';
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
    const Domain = DbConnectionManager.getCoreModel<IDomain>(MONGOOSE_MODELS.CORE_DB.DOMAIN);
    if (!checkDomainAvailability(domainName)) {
        logger.error(`Tenant invalid - domain already exist ${domainName}`);
        throw new BadRequestError(ERROR_CODE.DOMAIN_ALREADY_EXIST, 'Domain already exist');
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
    const Domain = DbConnectionManager.getCoreModel<IDomain>(MONGOOSE_MODELS.CORE_DB.DOMAIN);
    const existingDomain = await Domain.findOne({ name: domainName, isReserved: false });
    if (existingDomain) {
        return false;
    }
    return true;
};

export const getDomainByTenantId = async (tenantId: string): Promise<IDomain> => {
    const Domain = DbConnectionManager.getCoreModel<IDomain>(MONGOOSE_MODELS.CORE_DB.DOMAIN);
    const domain = await Domain.findOne({ tenant: tenantId });
    return domain;
};

export const getDomainByName = async (
    domainName: string,
    populateTenant?: boolean,
): Promise<IDomain> => {
    const Domain = DbConnectionManager.getCoreModel<IDomain>(MONGOOSE_MODELS.CORE_DB.DOMAIN);
    const domain = await Domain.findOne({ name: domainName }).populate(
        populateTenant ? 'tenant' : '',
    );
    return domain;
};

/**
 *
 * @returns deletes all domains related to the current tenant and returns total number of deleted domains.
 */
export const deleteDomainsByTenantId = async (): Promise<number> => {
    const Domain = DbConnectionManager.getCoreModel<IDomain>(MONGOOSE_MODELS.CORE_DB.DOMAIN);
    const currentTenantId = AuthUtil.getCurrentTenantId();
    const deleteDomains = await Domain.deleteMany({ tenant: currentTenantId });
    return deleteDomains.deletedCount;
};

/**
 * updates domain for a tenant, it just replaces the domain without updating the domain _id -
 * NOTE:- custom domain updation for same tenant will be handled separately
 *
 * @param tenantId id of the tenant
 * @param newDomain name of the new domain
 *
 * @returns updated domain document
 */
export const udpateDomainByTenantId = async (
    tenantId: string,
    newDomain: string,
): Promise<IDomain> => {
    const Domain = DbConnectionManager.getCoreModel<IDomain>(MONGOOSE_MODELS.CORE_DB.DOMAIN);
    if (!checkDomainAvailability(newDomain)) {
        logger.error(`Domain already exist ${newDomain}`);
        throw new BadRequestError(ERROR_CODE.DOMAIN_ALREADY_EXIST, 'Domain already exist');
    }
    const domain = await Domain.findOneAndUpdate(
        { tenant: tenantId, isCustom: false },
        { $set: { name: newDomain } },
        { new: true },
    );
    return domain;
};
