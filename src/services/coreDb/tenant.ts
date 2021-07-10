import { AuthUtil, BadRequestError, logger } from '@sellerspot/universal-functions';
import { ERROR_CODE } from '@sellerspot/universal-types';
import { Model } from 'mongoose';
import { DbConnectionManager } from '../../configs/DbConnectionManager';
import { coreDbModels, MONGOOSE_MODELS } from '../../models';
import { IStoreCurrency } from '../../models/coreDb';
import { ITenant, IInstalledPlugin } from '../../models/coreDb/Tenant';
import { getDefaultStoreCurrencyId } from '../../seeds';
import { getPluginById } from './plugin';

type TTenantAttrs = Pick<ITenant, 'storeName' | 'primaryEmail'>;

/**
 *
 * @returns the tenant currency model
 */
export const getTenantModel = <T extends coreDbModels.ITenantDoc>(): Model<T> =>
    DbConnectionManager.getCoreModel<T>(MONGOOSE_MODELS.CORE_DB.TENANT);

export const createTenant = async (tenantDetails: TTenantAttrs): Promise<ITenant> => {
    const { primaryEmail, storeName } = tenantDetails;
    const Tenant = getTenantModel();
    const existingTenant = await Tenant.findOne({ primaryEmail });
    if (existingTenant) {
        logger.error(`Tenant with the email ${primaryEmail} already exist`);
        throw new BadRequestError(
            ERROR_CODE.TENANT_ALREADY_EXIST,
            `Tenant with email ${primaryEmail} already exist.`,
        );
    }
    let tenant = await Tenant.create({
        storeName,
        primaryEmail,
        storeCurrency: getDefaultStoreCurrencyId(),
    });
    tenant = await tenant
        .populate({ path: 'plugins.plugin' })
        .populate({ path: 'storeCurrency' })
        .execPopulate();
    logger.info(`Tenant registered successfully ${primaryEmail} - ${tenant.id}`);
    return tenant;
};

export const getTenantById = async (
    tenantId: string,
    options?: {
        populatePlugins?: boolean;
        populateStoreCurrency?: boolean;
    },
): Promise<ITenant> => {
    const Tenant = getTenantModel();
    const tenantQuery = Tenant.findById(tenantId);
    if (options?.populatePlugins) tenantQuery.populate({ path: 'plugins.plugin' });
    if (options?.populateStoreCurrency)
        tenantQuery.populate({
            path: 'storeCurrency',
        });
    const tenant = await tenantQuery.exec();

    return tenant;
};

/**
 * Deletes the current tenant
 */
export const deleteTenant = async (): Promise<ITenant> => {
    const Tenant = getTenantModel();
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
    const plugin = await getPluginById(pluginId, { populateDependantPlugins: true });

    const isAlreadyInstalled = await checkIsPluginAlreadyInstalled(pluginId, tenantId);
    if (isAlreadyInstalled) {
        logger.error(`Plugin ${pluginId} already installed for tenant ${tenantId}`);
        throw new BadRequestError(ERROR_CODE.PLUGIN_ALREADY_INSTALLED, 'Plugin already installed');
    }

    // tenant validation
    const pluginsToInstall = [pluginId];

    // push any dependant plugins for the current plugin
    pluginsToInstall.push(...(((plugin.dependantPlugins ?? []) as unknown) as string[]));

    const Tenant = getTenantModel();

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
    ).populate({
        path: 'plugins.plugin',
    });
    return tenant.plugins;
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
    const Tenant = getTenantModel();
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
    const plugin = await getPluginById(pluginId);

    const pluginsToUninstall = [plugin._id.toString()];

    // check if any one of the current dependant plugin is dependant plugin to others and insert it into pluginToUninstall array
    pluginsToUninstall.push(
        ...(<string[]>plugin?.dependantPlugins).map((dependantPlugin) =>
            dependantPlugin.toString(),
        ),
    ); // temp - remove while implementing above logic

    // tenant validation
    const Tenant = getTenantModel();
    const tenant = await Tenant.findByIdAndUpdate(tenantId);

    tenant.plugins = tenant.plugins.filter(
        (installedPlugin) =>
            !pluginsToUninstall.includes(<string>installedPlugin.plugin.toString()),
    );

    await tenant.save();

    await tenant.populate({ path: 'plugins.plugin' }).execPopulate();

    return tenant.plugins;
};

/**
 * udpate the store currency by currencyId and tenantID
 */
export const updateStoreCurrencyById = async (
    tenantId: string,
    currencyId: string,
): Promise<IStoreCurrency> => {
    const Tenant = getTenantModel();
    const tenant = await Tenant.findByIdAndUpdate(
        tenantId,
        {
            storeCurrency: currencyId,
        },
        { new: true },
    ).populate({
        path: 'storeCurrency',
    });
    if (!tenant) {
        logger.error(`Tenant with id not found ${tenantId}`);
        throw new BadRequestError(ERROR_CODE.TENANT_INVALID, `Tenant with id not found.`);
    }
    return tenant.toJSON().storeCurrency as IStoreCurrency;
};
