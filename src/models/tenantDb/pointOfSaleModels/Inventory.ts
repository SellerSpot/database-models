import { Document, model, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { IBrand, ICategory, IOutlet, IProduct } from '../catalogueModels';

const InventorySchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT,
        },
        brand: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
        },
        tags: [Schema.Types.String],
        landingCost: Schema.Types.Number,
        sellingPrice: Schema.Types.Number,
        markup: Schema.Types.Number,
        active: Schema.Types.Boolean,
        outlet: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.OUTLET,
        },
        stockLevel: Schema.Types.Number,
    },
    {
        timestamps: true,
    },
);

export interface IInventory extends Document {
    product: string | IProduct;
    brand: string | IBrand;
    category: string | ICategory;
    tags: [string];
    landingCost: number;
    sellingPrice: number;
    markup: number;
    active: boolean;
    outlet: string | IOutlet;
    stockLevel: number;
}

export const InventoryModel = model<IInventory>(
    MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.INVENTORY,
    InventorySchema,
);
