import { Schema, model, Model, Document } from 'mongoose';
import { EMODELS } from './models.types';

const TaxBracketSchema = new Schema({
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
});

export interface ITaxBracketSchema {
    name: string;
    taxPercent: string;
}

export type ITaxBracketSchemaModel = Model<ITaxBracketSchema & Document>;

export const TaxBracketModel: ITaxBracketSchemaModel = model(EMODELS.TAXBRACKET, TaxBracketSchema);
