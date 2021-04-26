import { Document, model, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';

const StockUnitSchema = new Schema(
    {
        name: Schema.Types.String,
        linkedProductsCount: Schema.Types.Number,
    },
    {
        timestamps: true,
    },
);

export interface IStockUnit extends Document {
    _id?: string;
    name: string;
    linkedProductsCount: number;
    createdAt?: string;
    updatedAt?: string;
}

export const StockUnit = model<IStockUnit>(
    MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT,
    StockUnitSchema,
);
