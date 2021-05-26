import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { SchemaService } from '../../SchemaService';

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

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET, TaxBracketSchema);
