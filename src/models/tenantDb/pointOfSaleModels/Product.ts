import MONGOOSE_MODELS from '../../mongooseModels';
import { Schema, model, Model, Document } from 'mongoose';

const ProductSchema = new Schema({
    name: {
        type: Schema.Types.String,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.CATEGORY,
        required: false,
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.BRAND,
        required: false,
    },
    gtinNumber: {
        type: Schema.Types.String,
        required: false,
        default: '00000000',
    },
    mrpPrice: {
        type: Schema.Types.Number,
        required: false,
        default: 0,
    },
    landingPrice: {
        type: Schema.Types.Number,
        required: false,
        default: 0,
    },
    sellingPrice: {
        type: Schema.Types.Number,
    },
    stockInformation: {
        availableStock: {
            type: Schema.Types.Number,
            min: 0,
        },
        stockUnit: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.STOCKUNIT,
        },
    },
    profitPercent: {
        type: Schema.Types.Number,
        min: -100,
        max: 100,
    },
    taxBracket: [
        {
            type: Schema.Types.ObjectId,
            required: false,
            ref: MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.TAXBRACKET,
        },
    ],
});

/**
 * Manually synced interface of the Product database model
 * to provide intellisense when perfoming database operations in controllers
 */
export interface IProductSchema {
    _id?: string;
    name: string;
    category: string;
    brand: string;
    gtinNumber?: string;
    mrpPrice?: number;
    landingPrice?: number;
    sellingPrice: number;
    stockInformation: {
        availableStock: number;
        stockUnit: string;
    };
    profitPercent?: number;
    taxBracket: string[];
    createdAt?: string;
    updatedAt?: string;
    __v?: string;
}

/**
 * Creating a model object to use with the IProduct interface to get intellisense in controllers
 */
export type IProductModel = Model<IProductSchema & Document>;

export const ProductModel: IProductModel = model(
    MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.PRODUCT,
    ProductSchema,
);
