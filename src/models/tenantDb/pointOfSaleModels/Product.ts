import { Schema, model, Model, Document } from 'mongoose';
import { IBrandSchema } from './Brand';
import { ICategorySchema } from './Category';
import { EMODELS } from './models.types';
import { IStockUnitSchema } from './StockUnit';
import { ITaxBracketSchema } from './TaxBracket';

const ProductSchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: EMODELS.CATEGORY,
        required: false,
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: EMODELS.BRAND,
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
        required: true,
    },
    stockInformation: {
        availableStock: {
            type: Schema.Types.Number,
            min: 0,
            required: true,
        },
        stockUnit: {
            type: Schema.Types.ObjectId,
            ref: EMODELS.STOCKUNIT,
            required: true,
        },
    },
    profitPercent: {
        type: Schema.Types.Number,
        min: -100,
        max: 100,
        required: true,
    },
    taxBracket: [
        {
            type: Schema.Types.ObjectId,
            required: false,
            ref: EMODELS.TAXBRACKET,
        },
    ],
});

/**
 * Manually synced interface of the Product database model
 * @use - to provide intellisense when perfoming database operations in controllers
 */
export interface IProductSchema {
    name: string;
    category: ICategorySchema;
    brand: IBrandSchema;
    gtinNumber?: string;
    mrpPrice?: number;
    landingPrice?: number;
    sellingPrice: number;
    stockInformation: {
        availableStock: number;
        stockUnit: IStockUnitSchema;
    };
    profitPercent?: number;
    taxBracket: ITaxBracketSchema[];
}

/**
 * Creating a model object to use with the IProduct interface to get intellisense in controllers
 */
export type IProductModel = Model<IProductSchema & Document>;

export const ProductModel: IProductModel = model(EMODELS.PRODUCT, ProductSchema);
