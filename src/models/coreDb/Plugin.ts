import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../mongooseModels';
import { SchemaService } from '../SchemaService';

export interface IPlugin extends Document {
    name: string;
    uniqueName: string;
    shortDescription: string;
    longDescription: string;
    iconName: string;
    image: string;
    bannerImages: string[];
    id?: string;
    createdAt?: string;
    updatedAt?: string;
}

export const PluginSchema = new Schema(
    {
        name: {
            type: Schema.Types.String,
            required: true,
        },
        uniqueName: {
            type: Schema.Types.String,
            required: true,
        },
        shortDescription: {
            type: Schema.Types.String,
        },
        longDescription: { type: Schema.Types.String },
        iconName: { type: Schema.Types.String },
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

SchemaService.set(MONGOOSE_MODELS.CORE_DB.PLUGIN, PluginSchema);
