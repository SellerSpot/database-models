import { Document, Schema, Types } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { SchemaService } from '../../SchemaService';
import { IBrandDoc } from './Brand';
import { ICategoryDoc } from './Category';
import { IStockUnitDoc } from './StockUnit';

export const ProductSchema = new Schema(
    {
        name: { type: Schema.Types.String, required: true },
        barcode: { type: Schema.Types.String },
        description: { type: Schema.Types.String },
        stockUnit: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT,
            required: true,
        },
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
        toJSON: {
            //Arg 1 -> actual doc Arg2 -> doc to be returned
            transform(_, ret) {
                ret.id = ret._id;
                delete ret._id;
            },
            versionKey: false,
        },
    },
);

export interface IProductDoc extends Document {
    id: string;
    name: string;
    barcode?: string;
    description?: string;
    stockUnit?: Types.ObjectId | IStockUnitDoc;
    brand?: Types.ObjectId | IBrandDoc;
    category?: Types.ObjectId | ICategoryDoc;
    createdAt?: string;
    updatedAt?: string;
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT, ProductSchema);
