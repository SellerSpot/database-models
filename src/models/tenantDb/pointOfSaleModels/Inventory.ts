import { Document, Schema, Types } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { SchemaService } from '../../SchemaService';
import { IOutletDoc, IProductDoc, ITaxSettingDoc } from '../catalogueModels';

export const InventorySchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT,
        },
        isActive: { type: Schema.Types.Boolean, default: true },
        tags: { type: [Schema.Types.String] },
        stock: { type: Schema.Types.Number, default: 0 },
        isTrack: { type: Schema.Types.Boolean, default: true },
        markup: { type: Schema.Types.Number },
        mrp: { type: Schema.Types.Number },
        landingCost: { type: Schema.Types.Number },
        sellingPrice: { type: Schema.Types.Number, required: true },
        taxSetting: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXSETTING,
        },
        outlet: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.OUTLET,
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

// unique composite index with outlet and product id
InventorySchema.index({ outlet: 1, product: 1 }, { unique: true });

// text index with tag (full text search)
InventorySchema.index({ tags: 'text' });

export interface IInventoryDoc extends Document {
    id: string;
    product: Types.ObjectId | IProductDoc;
    isActive: boolean;
    tags?: [string];
    stock: number;
    isTrack: boolean;
    mrp: number;
    markup?: number;
    landingCost?: number;
    sellingPrice: number;
    taxSetting?: Types.ObjectId | ITaxSettingDoc;
    outlet: Types.ObjectId | IOutletDoc;
    createdAt?: string;
    updatedAt?: string;
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.INVENTORY, InventorySchema);
