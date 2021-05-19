import { Document, Schema } from 'mongoose';
import { CONFIG } from '../../configs/config';
import { MONGOOSE_MODELS } from '../mongooseModels';
import { MODEL_NAME_VS_SCHEMA } from '../schemaMap';
import { IPlugin } from './Plugin';

export interface ITenant {
    storeName: string;
    primaryEmail: string;
    plugins?: string[] | IPlugin[];
}

export interface ITenantDoc extends ITenant, Document {}

export const TenantSchema = new Schema(
    {
        storeName: {
            type: Schema.Types.String,
            min: CONFIG.DEFAULT_MIN_TEXT_SIZE,
            max: CONFIG.DEFAULT_MAX_TEXT_SIZE,
            required: true,
            trim: true,
        },
        primaryEmail: {
            type: Schema.Types.String,
            required: true,
            lowercase: true,
            trim: true,
        },
        plugins: [{ type: Schema.Types.ObjectId, ref: MONGOOSE_MODELS.CORE_DB.PLUGIN }],
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

MODEL_NAME_VS_SCHEMA.set(MONGOOSE_MODELS.CORE_DB.TENANT, TenantSchema);
