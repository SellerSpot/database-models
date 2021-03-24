import { Schema, model, Model, Document } from 'mongoose';
import { MONGOOSE_MODELS } from '../..';

const Brand = new Schema(
    {
        name: Schema.Types.String,
        linkedProductsCount: Schema.Types.Number,
    },
    {
        timestamps: true,
    },
);

export interface IBrand {
    _id?: string;
    name: string;
    linkedProductsCount: number;
    createdAt?: string;
    updatedAt?: string;
}

export type IBrandModel = Model<IBrand & Document>;

export const BaseModel: IBrandModel = model(
    MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND,
    Brand,
);
