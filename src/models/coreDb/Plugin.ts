import { Document, Schema, model } from 'mongoose';
import { MONGOOSE_MODELS } from '..';

export interface IPlugin extends Document {
    name: string;
    shortDescription: string;
    longDescription: string;
    iconUrl: string;
    bannerImages: string[];
}

const PluginSchema = new Schema(
    {
        name: {
            type: Schema.Types.String,
            required: true,
        },
        shortDescription: {
            type: Schema.Types.String,
        },
        longDescription: { type: Schema.Types.String },
        iconUrl: { type: Schema.Types.String },
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

const PluginModel = model<IPlugin>(MONGOOSE_MODELS.CORE_DB.PLUGIN, PluginSchema);

export { PluginModel };
