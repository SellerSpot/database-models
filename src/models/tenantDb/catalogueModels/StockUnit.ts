import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { MODEL_NAME_VS_SCHEMA } from '../../schemaMap';

export const StockUnitSchema = new Schema(
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

MODEL_NAME_VS_SCHEMA.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT, StockUnitSchema);
