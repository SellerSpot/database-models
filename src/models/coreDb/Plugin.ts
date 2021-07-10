import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../mongooseModels';
import { SchemaService } from '../SchemaService';

export interface IPlugin {
    name: string;
    /**
     * should be assigned through universal-types EPLUGIN enum
     */
    uniqueName: string;
    isVisibleInPluginMenu: boolean;
    isVisibleInPluginStore: boolean;
    dependantPlugins: string[] | IPlugin[];
    shortDescription: string;
    longDescription: string;
    icon: string;
    image: string;
    bannerImages: string[];
    /**
     * custom id should be passed
     */
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type IPluginDoc = IPlugin & Document;

export const PluginSchema = new Schema(
    {
        _id: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        uniqueName: {
            type: Schema.Types.String,
            unique: true,
            required: true,
        },
        name: {
            type: Schema.Types.String,
            required: true,
        },
        isVisibleInPluginMenu: {
            type: Schema.Types.Boolean,
            default: true,
        },
        isVisibleInPluginStore: {
            type: Schema.Types.Boolean,
            default: true,
        },
        dependantPlugins: [
            {
                type: Schema.Types.ObjectId,
                ref: MONGOOSE_MODELS.CORE_DB.PLUGIN,
                default: [],
            },
        ],
        shortDescription: {
            type: Schema.Types.String,
            required: true,
        },
        longDescription: { type: Schema.Types.String },
        icon: { type: Schema.Types.String },
        image: { type: Schema.Types.String },
        bannerImages: [
            {
                type: Schema.Types.String,
            },
        ],
    },
    {
        timestamps: true,
        _id: false,
    },
);

SchemaService.set(MONGOOSE_MODELS.CORE_DB.PLUGIN, PluginSchema);
