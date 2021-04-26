import { Document, model, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';

const CategorySchema = new Schema(
    {
        name: Schema.Types.String,
        linkedProductsCount: Schema.Types.Number,
    },
    {
        timestamps: true,
    },
);

export interface ICategory extends Document {
    name: string;
    linkedProductsCount: number;
}

export const CategoryModel = model<ICategory>(
    MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    CategorySchema,
);
