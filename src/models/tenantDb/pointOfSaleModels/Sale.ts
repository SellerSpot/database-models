import MONGOOSE_MODELS from '../../mongooseModels';
import { Schema, model, Model, Document } from 'mongoose';

export enum ESaleStatus {
    COMPLETED = 'COMPLETED',
    PENDING = 'PENDING',
}

export interface ISaleItem {
    _id?: string;
    product: string;
    quantity: number;
}

export const SaleSchema = new Schema(
    {
        status: {
            type: Schema.Types.String,
            enum: [ESaleStatus.COMPLETED, ESaleStatus.PENDING],
        },
        products: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.PRODUCT,
                },
                quantity: {
                    type: Schema.Types.Number,
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
    },
    { timestamps: true },
);

export interface ISaleSchema {
    _id?: string;
    status: ESaleStatus;
    products?: ISaleItem[];
    subTotal?: number;
    discountPercent?: number;
    totalTax?: number;
    grandTotal?: number;
    createdAt?: string;
    updatedAt?: string;
    __v?: string;
}

export type ISaleModel = Model<ISaleSchema & Document>;

export const SaleModel: ISaleModel = model(
    MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.SALE,
    SaleSchema,
);
