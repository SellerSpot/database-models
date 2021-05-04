import { BadRequestError, logger } from '@sellerspot/universal-functions';
import { ERROR_CODE } from '@sellerspot/universal-types';
import { DbConnectionManager } from '../../configs/initializer';
import { MONGOOSE_MODELS } from '../../models';
import { ITenantDoc, ITenant } from '../../models/coreDb/Tenant';

type TTenantAttrs = Pick<ITenant, 'storeName' | 'primaryEmail'>;

export const createTenant = async (tenantDetails: TTenantAttrs): Promise<ITenantDoc> => {
    const { primaryEmail, storeName } = tenantDetails;
    const Tenant = DbConnectionManager.getCoreModel<ITenantDoc>(MONGOOSE_MODELS.CORE_DB.TENANT);
    const existingTenant = await Tenant.findOne({ primaryEmail });
    if (existingTenant) {
        logger.error(`Tenant with the email ${primaryEmail} already exist`);
        throw new BadRequestError(
            ERROR_CODE.TENANT_ALREADY_EXIST,
            `Tenant with email ${primaryEmail} already exist.`,
        );
    }
    const tenant = await Tenant.create({ storeName, primaryEmail });
    logger.info(`Tenant registered successfully ${primaryEmail} - ${tenant.id}`);
    return tenant;
};

export const getTenantById = async (tenantId: string): Promise<ITenantDoc> => {
    const Tenant = DbConnectionManager.getCoreModel<ITenantDoc>(MONGOOSE_MODELS.CORE_DB.TENANT);
    const tenant = await Tenant.findById(tenantId);
    return tenant;
};
