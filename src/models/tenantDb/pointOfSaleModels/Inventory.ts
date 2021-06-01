import { Document, Schema, Types } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { SchemaService } from '../../SchemaService';
import { IBrand, ICategory, IOutlet, IProduct } from '../catalogueModels';

export const InventorySchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            required: true,
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
        tags: [{ type: Schema.Types.String }],
        markupPercent: { type: Schema.Types.Number },
        landingCost: { type: Schema.Types.Number },
        sellingPrice: { type: Schema.Types.Number },
        stock: { type: Schema.Types.Number, default: 0 },
        isTrackInventory: { type: Schema.Types.Boolean, default: false },
        isActive: { type: Schema.Types.Boolean, default: true },
        outlet: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.OUTLET,
        },
    },
    {
        timestamps: true,
    },
);

// unique composite index with outlet and product id
InventorySchema.index({ outlet: 1, product: 1 }, { unique: true, dropDups: true });

// text index with tag (full text search)
InventorySchema.index({ tags: 'text' });

export interface IInventory extends Document {
    id: string;
    product: Types.ObjectId | IProduct;
    tags: [string];
    markupPercent: number;
    landingCost: number;
    sellingPrice: number;
    stock: number;
    isTrackInventory: true;
    isActive: boolean;
    outlet: Types.ObjectId | IOutlet;
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.INVENTORY, InventorySchema);
