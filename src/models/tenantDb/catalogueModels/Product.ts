import { Document, model, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { IStockUnit } from './StockUnit';

const ProductSchema = new Schema(
    {
        name: String,
        barcode: String,
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
    _id?: string;
    name: string;
    barcode: string;
    stockUnit: string | IStockUnit;
    createdAt?: string;
    updatedAt?: string;
}

export const ProductModel = model<IProduct>(
    MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT,
    ProductSchema,
);
