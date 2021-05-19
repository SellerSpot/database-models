import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { MODEL_NAME_VS_SCHEMA } from '../../schemaMap';

export const TaxBracketSchema = new Schema(
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

export interface ITaxBracket extends Document {
    name: string;
    rate: number;
    isStateTax: boolean;
    linkedProductsCount: number;
}

MODEL_NAME_VS_SCHEMA.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET, TaxBracketSchema);
