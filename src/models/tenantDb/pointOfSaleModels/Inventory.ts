import { Schema, model, Model, Document } from 'mongoose';
import { catalogueModels } from '..';
import { MONGOOSE_MODELS} from '../..';

const Inventory = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT
        },
        brand: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY
        },
        tags: [Schema.Types.String],
        landingCost: Schema.Types.Number,
        sellingPrice: Schema.Types.Number,
        markup: Schema.Types.Number,
        active: Schema.Types.Boolean,
        outlet: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.OUTLET
        },
        stockLevel: Schema.Types.Number,
    },
    {
        timestamps: true,
    },
);

export interface IInventory {
    _id?: string;
    product: string | catalogueModels.ProductModel.IProduct,
    brand: string | catalogueModels.BrandModel.IBrand,
    category: string | catalogueModels.CategoryModel.ICategory,
    tags: [string],
    landingCost: number,
    sellingPrice: number,
    markup: number,
    active: boolean,
    outlet: string | catalogueModels.OutletModel.IOutlet,
    stockLevel: number,
    createdAt?: string;
    updatedAt?: string;
}

export type IInventoryModel = Model<IInventory & Document>;

export const BaseModel: IInventoryModel = model(
    MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.INVENTORY,
    Inventory,
);
