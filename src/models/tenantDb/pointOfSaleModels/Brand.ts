import { Schema, model, SchemaDefinition, Model, Document } from 'mongoose';
import { EMODELS } from './models.types';

const brandSchemaDefinition: SchemaDefinition = {
    name: {
        type: Schema.Types.String,
        required: true,
    },
};

export interface IBrandSchema {
    _id: string;
    name: string;
    createdAt: Schema.Types.Date;
    updatedAt: Schema.Types.Date;
}

export type IBrandModel = Model<IBrandSchema & Document>;

const BrandSchema = new Schema(brandSchemaDefinition, { timestamps: true });

export const BrandModel: IBrandModel = model(EMODELS.BRAND, BrandSchema);
