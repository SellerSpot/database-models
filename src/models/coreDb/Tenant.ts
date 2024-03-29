import { Document, Schema } from 'mongoose';
import { CONFIG } from '../../configs/config';
import { MONGOOSE_MODELS } from '../mongooseModels';
import { SchemaService } from '../SchemaService';
import { IPlugin } from './Plugin';
import { IStoreCurrency } from './StoreCurrency';

export interface IInstalledPlugin extends Document {
    plugin: string | IPlugin;
    createdAt?: string;
    updatedAt?: string;
}
export interface ITenant {
    id: string;
    storeName: string;
    primaryEmail: string;
    plugins: IInstalledPlugin[];
    storeCurrency: string | IStoreCurrency;
}

export type ITenantDoc = ITenant & Document;

const pluginSchema = new Schema(
    {
        plugin: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.CORE_DB.PLUGIN,
            index: true,
            required: true,
        },
    },
    {
        timestamps: true,
        _id: false,
    },
);

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
        plugins: [pluginSchema],
        storeCurrency: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: MONGOOSE_MODELS.CORE_DB.STORE_CURRENCY,
        },
    },
    {
        timestamps: true,
    },
);

SchemaService.set(MONGOOSE_MODELS.CORE_DB.TENANT, TenantSchema);
