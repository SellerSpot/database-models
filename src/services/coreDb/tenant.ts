import { AuthUtil, BadRequestError, logger } from '@sellerspot/universal-functions';
import { ERROR_CODE } from '@sellerspot/universal-types';
import { PopulateOptions } from 'mongoose';
import { DbConnectionManager } from '../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../models';
import { IPlugin } from '../../models/coreDb';
import { ITenantDoc, ITenant, IInstalledPlugin } from '../../models/coreDb/Tenant';

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

/**
 * Deletes the current tenant
 */
export const deleteTenant = async (): Promise<ITenantDoc> => {
    const Tenant = DbConnectionManager.getCoreModel<ITenantDoc>(MONGOOSE_MODELS.CORE_DB.TENANT);
    const currentTenantId = AuthUtil.getCurrentTenantId();
    const tenant = await Tenant.findByIdAndDelete(currentTenantId);
    return tenant;
};

/**
 * add plugin
 * install plugin for the user
 */
export const addPlugin = async (
    tenantId: string,
    pluginId: string,
): Promise<IInstalledPlugin[]> => {
    // plugin validation
    const Plugin = DbConnectionManager.getCoreModel<IPlugin>(MONGOOSE_MODELS.CORE_DB.PLUGIN);
    const isValidPlugin = await Plugin.exists({ _id: pluginId });
    if (!isValidPlugin) {
        logger.error('Invalid Plugin installation intent');
        throw new BadRequestError(ERROR_CODE.INVALID_PLUGIN, 'Invalid Plugin');
    }

    // tenant validation
    const Tenant = DbConnectionManager.getCoreModel<ITenantDoc>(MONGOOSE_MODELS.CORE_DB.TENANT);
    const tenant = await Tenant.findByIdAndUpdate(tenantId, {
        $push: { plugins: { plugin: pluginId } },
    }).populate(<PopulateOptions>{ path: 'plugins.plugin' });

    return tenant.plugins;
};

/**
 * remove plugin
 */
export const removePlugin = async (
    pluginId: string,
    tenantId: string,
): Promise<IInstalledPlugin[]> => {
    // plugin validation
    const Plugin = DbConnectionManager.getCoreModel<IPlugin>(MONGOOSE_MODELS.CORE_DB.PLUGIN);
    const isValidPlugin = await Plugin.exists({ _id: pluginId });
    if (!isValidPlugin) {
        logger.error('Invalid Plugin installation intent');
        throw new BadRequestError(ERROR_CODE.INVALID_PLUGIN, 'Invalid Plugin');
    }

    // tenant validation
    const Tenant = DbConnectionManager.getCoreModel<ITenantDoc>(MONGOOSE_MODELS.CORE_DB.TENANT);
    const tenant = await Tenant.findByIdAndUpdate(tenantId, {
        $pull: { plugins: { plugin: pluginId } },
    }).populate(<PopulateOptions>{ path: 'plugins.plugin' });

    return tenant.plugins;
};
