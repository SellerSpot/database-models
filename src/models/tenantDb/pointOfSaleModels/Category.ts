import { Schema, model, Model, Document } from 'mongoose';
import { EMODELS } from './models.types';

const CategorySchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true,
        unique: true,
    },
});

export interface ICategorySchema {
    name: string;
}

export type ICategorySchemaModel = Model<ICategorySchema & Document>;

export const CategoryModel: ICategorySchemaModel = model(EMODELS.CATEGORY, CategorySchema);
