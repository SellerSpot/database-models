import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { SchemaService } from '../../SchemaService';

export const StockUnitSchema = new Schema(
    {
        name: { type: Schema.Types.String, required: true },
        unit: { type: Schema.Types.String, required: true },
        isDefault: { type: Schema.Types.Boolean, default: false },
    },
    {
        timestamps: true,
        toJSON: {
            //Arg 1 -> actual doc Arg2 -> doc to be returned
            transform(_, ret) {
                ret.id = ret._id;
                delete ret._id;
            },
            versionKey: false,
        },
    },
);

export interface IStockUnitDoc extends Document {
    id: string;
    name: string;
    unit: string;
    isDefault?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT, StockUnitSchema);
