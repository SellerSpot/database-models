import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { SchemaService } from '../../SchemaService';
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

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXGROUP, TaxGroupSchema);
