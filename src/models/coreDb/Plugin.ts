import { Document, Model, Schema, model } from 'mongoose';
import { MONGOOSE_MODELS } from '..';

const PluginSchema = new Schema(
    {
        name: String,
        shortDescription: String,
        longDescription: String,
        iconUrl: String,
        bannerImages: [
            {
                type: String,
            },
        ],
    },
    { timestamps: true },
);

export interface IPlugin {
    name: string;
    shortDescription: string;
    longDescription: string;
    iconUrl: string;
    bannerImages: string[];
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type IPluginModel = Model<IPlugin & Document>;

export const PluginModel: IPluginModel = model(MONGOOSE_MODELS.CORE_DB.PLUGIN, PluginSchema);
