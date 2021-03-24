import { Schema, model, Model, Document } from 'mongoose';
import { MONGOOSE_MODELS } from '../..';

const StockUnit = new Schema(
    {
        name: Schema.Types.String,
        linkedProductsCount: Schema.Types.Number,
    },
    {
        timestamps: true,
    },
);

export interface IStockUnit {
    _id?: string;
    name: string;
    linkedProductsCount: number;
    createdAt?: string;
    updatedAt?: string;
}

export type IStockUnitModel = Model<IStockUnit & Document>;

export const BaseModel: IStockUnitModel = model(
    MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT,
    StockUnit,
);
