import { Document, model, Model, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../..';
import { IStockUnit } from './StockUnit';

const Product = new Schema(
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

export interface IProduct {
    _id?: string;
    name: string;
    barcode: string;
    stockUnit: string | IStockUnit;
    createdAt?: string;
    updatedAt?: string;
}

export type IProductModel = Model<IProduct & Document>;

export const BaseModel: IProductModel = model(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT, Product);
