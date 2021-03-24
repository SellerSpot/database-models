import { Schema, model, Model, Document } from 'mongoose';
import { MONGOOSE_MODELS } from '../..';

const TaxBracket = new Schema(
    {
        name: Schema.Types.String,
        rate: Schema.Types.Number,
        isStateTax: Schema.Types.Boolean,
        linkedProductsCount: Schema.Types.Number,
    },
    {
        timestamps: true,
    },
);

export interface ITaxBracket {
    _id?: string;
    name: string;
    rate: number;
    isStateTax: boolean;
    linkedProductsCount: number;
    createdAt?: string;
    updatedAt?: string;
}

export type ITaxBracketModel = Model<ITaxBracket & Document>;

export const BaseModel: ITaxBracketModel = model(
    MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATALOGUE_TAXBRACKET,
    TaxBracket,
);
