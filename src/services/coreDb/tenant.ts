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

export const getTenantById = async (
    tenantId: string,
    populatePlugins: boolean,
): Promise<ITenantDoc> => {
    const Tenant = DbConnectionManager.getCoreModel<ITenantDoc>(MONGOOSE_MODELS.CORE_DB.TENANT);
    const tenant = await (populatePlugins
        ? Tenant.findById(tenantId).populate(<PopulateOptions>{ path: 'plugins.plugin' })
        : Tenant.findById(tenantId));
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
    pluginId: string,
    tenantId: string,
): Promise<IInstalledPlugin[]> => {
    // plugin validation
    const Plugin = DbConnectionManager.getCoreModel<IPlugin>(MONGOOSE_MODELS.CORE_DB.PLUGIN);
    const plugin = await Plugin.findOne({ pluginId });
    if (!plugin) {
        logger.error('Invalid Plugin installation intent');
        throw new BadRequestError(ERROR_CODE.PLUGIN_INVALID, 'Invalid Plugin');
    }

    const isAlreadyInstalled = await checkIsPluginAlreadyInstalled(pluginId, tenantId);
    if (isAlreadyInstalled) {
        logger.error(`Plugin ${pluginId} already installed for tenant ${tenantId}`);
        throw new BadRequestError(ERROR_CODE.PLUGIN_ALREADY_INSTALLED, 'Plugin already installed');
    }

    // tenant validation
    const pluginsToInstall = [pluginId];

    // push any dependant plugins for the current plugin
    pluginsToInstall.push(...(((plugin.dependantPlugins ?? []) as unknown) as string[]));

    const Tenant = DbConnectionManager.getCoreModel<ITenantDoc>(MONGOOSE_MODELS.CORE_DB.TENANT);

    // structing the array of plugin object to push all at one shot
    const structuredPluginsToInstall: { plugin: string }[] = pluginsToInstall.map(
        (pluginToInstall) => ({
            plugin: pluginToInstall,
        }),
    );
    const tenant = await Tenant.findByIdAndUpdate(
        tenantId,
        {
            $push: { plugins: { $each: structuredPluginsToInstall } },
        },
        { new: true },
    ).populate('populatePlugins');

    //it works ;)
    const pluginsList: IInstalledPlugin[] = [];
    const poulatedPlugins = tenant.populatePlugins;
    tenant.plugins.forEach((pluginDoc, i) => {
        pluginDoc = <IInstalledPlugin>pluginDoc.toJSON();
        pluginDoc.plugin = <IPlugin>poulatedPlugins[i].toJSON();
        pluginsList.push(pluginDoc);
    });
    return pluginsList;
};

/**
 * check whether the plugin is already installed or not
 *
 * @param pluginId - id of the plugin
 * @param tenantId - id of the tenant
 * @returns boolean tells the plugin installation status
 */
export const checkIsPluginAlreadyInstalled = async (
    pluginId: string,
    tenantId: string,
): Promise<boolean> => {
    const Tenant = DbConnectionManager.getCoreModel<ITenantDoc>(MONGOOSE_MODELS.CORE_DB.TENANT);
    const alreadyInstalled = await Tenant.exists({
        _id: tenantId,
        'plugins.plugin': pluginId,
    });
    return alreadyInstalled;
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
    const plugin = await Plugin.findOne({ pluginId }).populate('dependantPlugins');
    if (!plugin) {
        logger.error('Invalid Plugin installation intent');
        throw new BadRequestError(ERROR_CODE.PLUGIN_INVALID, 'Invalid Plugin');
    }

    const pluginsToUninstall = [pluginId];

    // check if any one of the current dependant plugin is dependant plugin to others and insert it into pluginToUninstall array
    // (<string[]>(<unknown>plugin.dependantPlugins))?.forEach((dependantPlugin) => {});
    pluginsToUninstall.push(...(<string[]>(<unknown>plugin?.dependantPlugins))); // temp - remove while implementing above logic

    // tenant validation
    const Tenant = DbConnectionManager.getCoreModel<ITenantDoc>(MONGOOSE_MODELS.CORE_DB.TENANT);
    // structing the array of plugin object to push all at one shot
    const structuredPluginsToUnInstall: { plugin: string }[] = pluginsToUninstall.map(
        (pluginToUnInstall: string) => ({
            plugin: pluginToUnInstall,
        }),
    );
    const tenant = await Tenant.findByIdAndUpdate(
        tenantId,
        {
            $pullAll: { plugins: structuredPluginsToUnInstall },
        },
        { new: true },
    ).populate('populatePlugins');

    //it works ;)
    const pluginsList: IInstalledPlugin[] = [];
    const poulatedPlugins = tenant.populatePlugins;
    tenant.plugins.forEach((pluginDoc, i) => {
        pluginDoc = <IInstalledPlugin>pluginDoc.toJSON();
        pluginDoc.plugin = <IPlugin>poulatedPlugins[i].toJSON();
        pluginsList.push(pluginDoc);
    });
    return pluginsList;
};
