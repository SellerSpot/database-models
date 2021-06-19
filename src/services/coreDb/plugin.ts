import { logger } from '@sellerspot/universal-functions';
import { IPlugin } from '@sellerspot/universal-types';
import { LeanDocument } from 'mongoose';
import { DbConnectionManager } from '../../configs/DbConnectionManager';
import { coreDbModels, MONGOOSE_MODELS } from '../../models';

export const createPlugin = async (
    plugin: IPlugin,
): Promise<LeanDocument<coreDbModels.IPlugin>> => {
    const Plugin = DbConnectionManager.getCoreModel<coreDbModels.IPlugin>(
        MONGOOSE_MODELS.CORE_DB.PLUGIN,
    );
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
    const plugin = await Plugin.findOne({ pluginId });
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
    const deletePlugin = await Domain.findOneAndDelete({ pluginId });
    return deletePlugin.toJSON();
};

/**
 * checks whether the passed plugin is already exist
 */
export const getAllPlugins = async (): Promise<coreDbModels.IPlugin[]> => {
    const Plugin = DbConnectionManager.getCoreModel<coreDbModels.IPlugin>(
        MONGOOSE_MODELS.CORE_DB.PLUGIN,
    );
    const plugins = await Plugin.find({ isVisibleInPluginStore: true });
    return plugins;
};
