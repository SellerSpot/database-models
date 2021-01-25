import { MONGOOSE_MODELS } from 'models';
import { Schema, model, SchemaDefinition, Model, Document } from 'mongoose';

const BrandSchema = new Schema(
    {
        name: {
            type: Schema.Types.String,
            required: true,
        },
    },
    { timestamps: true },
);

export interface IBrandSchema {
    _id?: string;
    name: string;
    createdAt?: string;
    updatedAt?: string;
}

export type IBrandModel = Model<IBrandSchema & Document>;

export const BrandModel: IBrandModel = model(
    MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.BRAND,
    BrandSchema,
);
