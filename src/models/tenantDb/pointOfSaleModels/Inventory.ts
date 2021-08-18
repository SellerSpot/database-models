import { Document, Schema, Types } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { SchemaService } from '../../SchemaService';
import { IOutletDoc, IProductDoc, ITaxBracketDoc } from '../catalogueModels';

export const InventorySchema = new Schema(
    {
        product: {
            name: Schema.Types.String,
            reference: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT,
            },
        },
        isActive: { type: Schema.Types.Boolean, default: true },
        stock: { type: Schema.Types.Number, default: 0 },
        isTrack: { type: Schema.Types.Boolean, default: true },
        markup: { type: Schema.Types.Number },
        mrp: { type: Schema.Types.Number },
        landingCost: { type: Schema.Types.Number },
        sellingPrice: { type: Schema.Types.Number, required: true },
        taxBracket: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET,
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

export interface IInventoryDoc extends Document {
    id: string;
    product: {
        name: string;
        reference: string | IProductDoc;
    };
    isActive: boolean;
    stock: number;
    isTrack: boolean;
    mrp: number;
    markup: number;
    landingCost: number;
    sellingPrice: number;
    taxBracket: Types.ObjectId | ITaxBracketDoc;
    outlet: Types.ObjectId | IOutletDoc;
    createdAt?: string;
    updatedAt?: string;
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.INVENTORY, InventorySchema);
