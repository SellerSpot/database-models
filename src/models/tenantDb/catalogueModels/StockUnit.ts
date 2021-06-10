import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { SchemaService } from '../../SchemaService';

export const StockUnitSchema = new Schema(
    {
        name: Schema.Types.String,
    },
    {
        timestamps: true,
    },
);

export interface IStockUnit extends Document {
    _id?: string;
    name: string;
    createdAt?: string;
    updatedAt?: string;
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT, StockUnitSchema);
