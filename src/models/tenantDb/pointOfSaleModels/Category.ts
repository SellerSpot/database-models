import { Document, Model, Schema, model } from 'mongoose';
import MONGOOSE_MODELS from '../../mongooseModels';

const CategorySchema = new Schema(
    {
        name: {
            type: Schema.Types.String,
            unique: true,
        },
    },
    { timestamps: true },
);

export interface ICategorySchema {
    _id?: string;
    name: string;
    createdAt?: string;
    updatedAt?: string;
    __v?: string;
}

export type ICategoryModel = Model<ICategorySchema & Document>;

export const CategoryModel: ICategoryModel = model(
    MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.CATEGORY,
    CategorySchema,
);
