import { ERROR_CODE, IPlugin } from '@sellerspot/universal-types';
import { LeanDocument, Model } from 'mongoose';
import { BadRequestError, logger } from '@sellerspot/universal-functions';
import { DbConnectionManager } from '../../configs/DbConnectionManager';
import { coreDbModels, MONGOOSE_MODELS } from '../../models';
import { getPluginsSeed } from '../../seeds/coreDb/plugin';

/**
 *
 * @returns the plugin model
 */
export const getPluginModel = <T extends coreDbModels.IPluginDoc>(): Model<T> =>
    DbConnectionManager.getCoreModel<T>(MONGOOSE_MODELS.CORE_DB.PLUGIN);

/**
 * seeds the store currencies into storeCurrency collection
 */
export const seedPlugins = async (): Promise<void> => {
    const Plugin = getPluginModel();
    const seeds = getPluginsSeed();
    await Plugin.bulkWrite(
        seeds.map((seed) => ({
            updateOne: {
                filter: { _id: seed._id },
                update: { $set: seed },
                upsert: true,
                new: true,
            },
        })),
    );
};

export const getPluginById = async (
    pluginId: string,
    options?: {
        populateDependantPlugins?: boolean;
    },
): Promise<LeanDocument<coreDbModels.IPluginDoc>> => {
    const Plugin = getPluginModel();
    const pluginQuery = Plugin.findById(pluginId);
    if (options?.populateDependantPlugins) pluginQuery.populate({ path: 'dependantPlugins' });
    const plugin = await pluginQuery.exec();
    if (!plugin) {
        logger.error('Invalid Plugin installation intent');
        throw new BadRequestError(ERROR_CODE.PLUGIN_INVALID, 'Invalid Plugin');
    }
    return plugin.toJSON();
};

/**
 * deletes the plugin for corresponding to the plugin id
 *
 * @returns the deleted plugin document
 */
export const deletePluginById = async (
    pluginId: string,
): Promise<LeanDocument<coreDbModels.IPluginDoc>> => {
    const Domain = DbConnectionManager.getCoreModel<coreDbModels.IPluginDoc>(
        MONGOOSE_MODELS.CORE_DB.PLUGIN,
    );
    const deletePlugin = await Domain.findByIdAndDelete(pluginId);
    return deletePlugin.toJSON();
};

/**
 * checks whether the passed plugin is already exist
 */
export const getAllPlugins = async (options?: {
    populateDependantPlugins?: boolean;
}): Promise<coreDbModels.IPlugin[]> => {
    const Plugin = DbConnectionManager.getCoreModel<coreDbModels.IPluginDoc>(
        MONGOOSE_MODELS.CORE_DB.PLUGIN,
    );
    const pluginsQuery = Plugin.find();
    if (options?.populateDependantPlugins) pluginsQuery.populate({ path: 'dependantPlugins' });
    const plugins = await pluginsQuery.exec();
    return plugins;
};
