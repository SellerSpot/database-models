import { Document, Schema, Types } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { IStockUnit } from './StockUnit';
import { SchemaService } from '../../SchemaService';

export const ProductSchema = new Schema(
    {
        name: { type: Schema.Types.String },
        barcode: { type: Schema.Types.String },
        stockUnit: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT,
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
    stockUnit: Types.ObjectId | IStockUnit;
    createdAt?: string;
    updatedAt?: string;
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT, ProductSchema);
