import { Document, Schema, Types } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { SchemaService } from '../../SchemaService';
import { IBrand } from './Brand';
import { ICategory } from './Category';

export const ProductSchema = new Schema(
    {
        name: { type: Schema.Types.String, required: true },
        barcode: { type: Schema.Types.String },
        description: { type: Schema.Types.String },
        brand: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
        },
    },
    {
        timestamps: true,
    },
);

export interface IProduct extends Document {
    id: string;
    name: string;
    barcode: string;
    description: string;
    brand: Types.ObjectId | IBrand;
    category: Types.ObjectId | ICategory;
    createdAt?: string;
    updatedAt?: string;
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT, ProductSchema);
