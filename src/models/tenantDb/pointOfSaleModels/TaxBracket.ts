import { Schema, model, Model, Document } from 'mongoose';
import MONGOOSE_MODELS from '../../mongooseModels';

const TaxBracketSchema = new Schema(
    {
        name: {
            type: Schema.Types.String,
            required: true,
        },
        taxPercent: {
            type: Schema.Types.Number,
            min: 0,
            max: 100,
            required: true,
        },
    },
    { timestamps: true },
);

export interface ITaxBracketSchema {
    _id?: string;
    name: string;
    taxPercent: string;
    createdAt?: string;
    updatedAt?: string;
}

export type ITaxBracketModel = Model<ITaxBracketSchema & Document>;

export const TaxBracketModel: ITaxBracketModel = model(
    MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.TAXBRACKET,
    TaxBracketSchema,
);
