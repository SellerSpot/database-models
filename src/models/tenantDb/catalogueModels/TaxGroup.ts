import { Document, model, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { ITaxBracket } from './TaxBracket';

const TaxGroupSchema = new Schema(
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

export const TaxGroupModel = model<ITaxGroup>(
    MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXGROUP,
    TaxGroupSchema,
);
