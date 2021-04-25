import { Document, model, Model, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../..';

const Category = new Schema(
    {
        name: Schema.Types.String,
        linkedProductsCount: Schema.Types.Number,
    },
    {
        timestamps: true,
    },
);

export interface ICategory {
    _id?: string;
    name: string;
    linkedProductsCount: number;
    createdAt?: string;
    updatedAt?: string;
}

export type ICategoryModel = Model<ICategory & Document>;

export const BaseModel: ICategoryModel = model(
    MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    Category,
);
