import { Schema, model, SchemaDefinition, Model, Document } from 'mongoose';
import { EMODELS } from './models.types';

export enum ESaleStatus {
    COMPLETED = 'COMPLETED',
    PENDING = 'PENDING',
}

interface ISaleItem {
    _id: string;
    product: string;
    quantity: number;
}

export const saleSchemaDefinition: SchemaDefinition = {
    status: {
        type: Schema.Types.String,
        enum: [ESaleStatus.COMPLETED, ESaleStatus.PENDING],
        required: true,
    },
    products: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: EMODELS.PRODUCT,
                required: true,
            },
            quantity: {
                type: Schema.Types.Number,
                required: true,
            },
        },
    ],
    subTotal: {
        type: Schema.Types.Number,
        min: 0,
        required: false,
        default: 0,
    },
    discountPercent: {
        type: Schema.Types.Number,
        min: 0,
        max: 100,
        required: false,
        default: 0,
    },
    totalTax: {
        type: Schema.Types.Number,
        min: 0,
        required: false,
        default: 0,
    },
    grandTotal: {
        type: Schema.Types.Number,
        min: 0,
        required: false,
        default: 0,
    },
    createdAt: {
        type: Schema.Types.Number,
        required: true,
    },
};
export interface ISale {
    status: ESaleStatus;
    products?: ISaleItem[];
    subTotal?: number;
    discountPercent?: number;
    totalTax?: number;
    grandTotal?: number;
    createdAt: string;
}

export type ISaleModel = Model<ISale & Document>;

const SaleSchema = new Schema(saleSchemaDefinition);

export const SaleModel: ISaleModel = model(EMODELS.SALE, SaleSchema);
