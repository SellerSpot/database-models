import { BadRequestError, logger } from '@sellerspot/universal-functions';
import { ERROR_CODE, IPlugin } from '@sellerspot/universal-types';
import { LeanDocument } from 'mongoose';
import { DbConnectionManager } from '../../configs/DbConnectionManager';
import { coreDbModels, MONGOOSE_MODELS } from '../../models';

export const createPlugin = async (
    plugin: IPlugin,
): Promise<LeanDocument<coreDbModels.IPlugin>> => {
    const { name } = plugin;
    const Plugin = DbConnectionManager.getCoreModel<coreDbModels.IPlugin>(
        MONGOOSE_MODELS.CORE_DB.PLUGIN,
    );
    if (await checkPluginAlreadyExist(name)) {
        logger.error(`Plugin with the same name ${name} already exist`);
        throw new BadRequestError(ERROR_CODE.OPERATION_FAILURE, 'Plugin already exist');
    }
    const pluginDocument = await Plugin.create({ ...plugin });
    logger.info(`New Plugin ${pluginDocument.name} has been added`);
    return pluginDocument.toJSON();
};

export const getPluginById = async (
    pluginId: string,
): Promise<LeanDocument<coreDbModels.IPlugin>> => {
    const Plugin = DbConnectionManager.getCoreModel<coreDbModels.IPlugin>(
        MONGOOSE_MODELS.CORE_DB.PLUGIN,
    );
    const plugin = await Plugin.findById(pluginId);
    return plugin;
};

/**
 * deletes the plugin for corresponding to the plugin id
 *
 * @returns the deleted plugin document
 */
export const deletePluginById = async (
    pluginId: string,
): Promise<LeanDocument<coreDbModels.IPlugin>> => {
    const Domain = DbConnectionManager.getCoreModel<coreDbModels.IPlugin>(
        MONGOOSE_MODELS.CORE_DB.PLUGIN,
    );
    const deletePlugin = await Domain.findByIdAndDelete(pluginId);
    return deletePlugin.toJSON();
};

/**
 * updates the properties for a plugin
 *
 * @param pluginId id of the plugin to be updated
 * @param pluginUpdateData name of the new plugin
 *
 * @returns updated plugin document
 */
export const updatePluginById = async (
    pluginId: string,
    pluginUpdateData: Partial<IPlugin>,
): Promise<LeanDocument<coreDbModels.IPlugin>> => {
    const Plugin = DbConnectionManager.getCoreModel<coreDbModels.IPlugin>(
        MONGOOSE_MODELS.CORE_DB.PLUGIN,
    );
    const plugin = await Plugin.findByIdAndUpdate(
        pluginId,
        { $set: { ...pluginUpdateData } },
        { new: true },
    );
    return plugin.toJSON();
};

/**
 * checks whether the passed plugin is already exist
 */
export const checkPluginAlreadyExist = async (pluginName: string): Promise<boolean> => {
    const Plugin = DbConnectionManager.getCoreModel<coreDbModels.IPlugin>(
        MONGOOSE_MODELS.CORE_DB.PLUGIN,
    );
    const existingPlugin = await Plugin.findOne({ name: pluginName });
    return !!existingPlugin;
};

/**
 * checks whether the passed plugin is already exist
 */
export const getAllPlugins = async (): Promise<coreDbModels.IPlugin[]> => {
    const Plugin = DbConnectionManager.getCoreModel<coreDbModels.IPlugin>(
        MONGOOSE_MODELS.CORE_DB.PLUGIN,
    );
    const plugins = await Plugin.find();
    return plugins;
};
