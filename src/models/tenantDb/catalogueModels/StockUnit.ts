import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { SchemaService } from '../../SchemaService';

export const StockUnitSchema = new Schema(
    {
        name: { type: Schema.Types.String, required: true },
        isDefault: { type: Schema.Types.Boolean, required: true, default: false },
    },
    {
        timestamps: true,
    },
);

export interface IStockUnit {
    name: string;
    isDefault: boolean;
    id?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type IStockUnitDoc = IStockUnit & Document;

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT, StockUnitSchema);
