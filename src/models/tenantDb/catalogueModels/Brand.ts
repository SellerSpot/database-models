import { Document, model, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';

const BrandSchema = new Schema(
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

export const BrandModel = model<IBrand>(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND, BrandSchema);
