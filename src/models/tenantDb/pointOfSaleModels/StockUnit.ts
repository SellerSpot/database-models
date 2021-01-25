import { Schema, model, Model, Document } from 'mongoose';
import MONGOOSE_MODELS from '../../mongooseModels';

const StockUnitSchema = new Schema(
    {
        name: {
            type: Schema.Types.String,
            required: true,
        },
    },
    { timestamps: true },
);

export interface IStockUnitSchema {
    _id?: string;
    name: string;
    createdAt?: string;
    updatedAt?: string;
}

export type IStockUnitModel = Model<IStockUnitSchema & Document>;

export const StockUnitModel: IStockUnitModel = model(
    MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.STOCKUNIT,
    StockUnitSchema,
);
