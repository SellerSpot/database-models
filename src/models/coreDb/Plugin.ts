import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../mongooseModels';
import { SchemaService } from '../SchemaService';

export interface IPlugin extends Document {
    pluginId: string;
    name: string;
    isVisibleInPluginMenu: boolean;
    isVisibleInPluginStore: boolean;
    dependantPlugins: string[] | IPlugin[];
    shortDescription: string;
    longDescription: string;
    icon: string;
    image: string;
    bannerImages: string[];
    createdAt?: string;
    updatedAt?: string;
}

export const PluginSchema = new Schema(
    {
        pluginId: {
            type: Schema.Types.String,
            required: true,
            unique: true,
            index: true,
            trim: true,
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
                type: Schema.Types.String,
                unique: true,
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
        toJSON: {
            //Arg 1 -> actual doc Arg2 -> doc to be returned
            transform(_, ret) {
                (ret.id = ret._id), delete ret._id;
            },
            versionKey: false,
        },
    },
);

/**
 * using unique Id as foreign key to populate instead _id
 */
PluginSchema.virtual('populateDependantPlugins', {
    ref: MONGOOSE_MODELS.CORE_DB.PLUGIN,
    localField: 'uniqueId',
    foreignField: 'dependantPlugins',
});

SchemaService.set(MONGOOSE_MODELS.CORE_DB.PLUGIN, PluginSchema);
