import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { SchemaService } from '../../SchemaService';

export const StockUnitSchema = new Schema(
    {
        name: { type: Schema.Types.String, required: true },
        isDefault: { type: Schema.Types.Boolean, default: false },
    },
    {
        timestamps: true,
    },
);

export interface IStockUnitDoc extends Document {
    id: string;
    name: string;
    isDefault?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT, StockUnitSchema);
