import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { MODEL_NAME_VS_SCHEMA } from '../../schemaMap';
import { ITaxBracket } from './TaxBracket';

export const TaxGroupSchema = new Schema(
    {
        name: Schema.Types.String,
        brackets: {
            type: [Schema.Types.ObjectId],
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET,
        },
        linkedProductsCount: Schema.Types.Number,
    },
    {
        timestamps: true,
    },
);

export interface ITaxGroup extends Document {
    _id?: string;
    name: string;
    brackets: string[] | ITaxBracket[];
    linkedProductsCount: number;
    createdAt?: string;
    updatedAt?: string;
}

MODEL_NAME_VS_SCHEMA.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXGROUP, TaxGroupSchema);
