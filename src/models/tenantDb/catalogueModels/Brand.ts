import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { MODEL_NAME_VS_SCHEMA } from '../../schemaMap';

export const BrandSchema = new Schema(
    {
        name: Schema.Types.String,
        linkedProductsCount: Schema.Types.Number,
    },
    {
        timestamps: true,
    },
);

export interface IBrand extends Document {
    name: string;
    linkedProductsCount: number;
}

MODEL_NAME_VS_SCHEMA.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND, BrandSchema);
