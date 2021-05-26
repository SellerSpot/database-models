import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { SchemaService } from '../../SchemaService';

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

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND, BrandSchema);
