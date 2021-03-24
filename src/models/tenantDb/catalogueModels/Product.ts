import { Schema, model, Model, Document } from 'mongoose';
import { catalogueModels } from '..';
import { MONGOOSE_MODELS } from '../..';

const Product = new Schema(
    {
        name: String,
        barcode: String,
        stockUnit: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.POINT_OF_SALE_STOCKUNIT
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
    stockUnit: string | catalogueModels.StockUnitModel.IStockUnit;
    createdAt?: string;
    updatedAt?: string;
}

export type IProductModel = Model<IProduct & Document>;

export const BaseModel: IProductModel = model(
    MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.POINT_OF_SALE_PRODUCT,
    Product,
);
