import { Document, Schema } from 'mongoose';
import { CONFIG } from '../../configs/config';
import { MONGOOSE_MODELS } from '../mongooseModels';
import { SchemaService } from '../SchemaService';
import { IPlugin } from './Plugin';

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
}

// remove ITenantDoc
export interface ITenantDoc extends ITenant, Document {
    id: string;
    populatePlugins: IPlugin[];
}

const pluginSchema = new Schema(
    {
        plugin: { type: Schema.Types.String },
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
    },
    {
        timestamps: true,
    },
);

/**
 * using unique Id as foreign key to populate instead _id
 */
TenantSchema.virtual('populatePlugins', {
    ref: MONGOOSE_MODELS.CORE_DB.PLUGIN,
    localField: 'plugins.plugin',
    foreignField: 'pluginId',
    justOne: false,
});

SchemaService.set(MONGOOSE_MODELS.CORE_DB.TENANT, TenantSchema);
