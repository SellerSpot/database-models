import { Schema, model, Model, Document } from 'mongoose';
import { catalogueModels } from '..';
import { MONGOOSE_MODELS } from '../..';

const TaxGroup = new Schema(
    {
        name: Schema.Types.String,
        brackets: {
            type: [Schema.Types.ObjectId],
            ref: MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.POINT_OF_SALE_TAXBRACKET
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
    brackets: string[] | catalogueModels.TaxBracketModel.ITaxBracket[];
    linkedProductsCount: number;
    createdAt?: string;
    updatedAt?: string;
}

export type ITaxGroupModel = Model<ITaxGroup & Document>;

export const BaseModel: ITaxGroupModel = model(
    MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.POINT_OF_SALE_TAXGROUP,
    TaxGroup,
);
