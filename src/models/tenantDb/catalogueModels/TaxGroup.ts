import { Document, model, Model, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../..';
import { ITaxBracket } from './TaxBracket';

const TaxGroup = new Schema(
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

export interface ITaxGroup {
    _id?: string;
    name: string;
    brackets: string[] | ITaxBracket[];
    linkedProductsCount: number;
    createdAt?: string;
    updatedAt?: string;
}

export type ITaxGroupModel = Model<ITaxGroup & Document>;

export const BaseModel: ITaxGroupModel = model(
    MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXGROUP,
    TaxGroup,
);
