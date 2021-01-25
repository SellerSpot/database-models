import { Schema, model, Model, Document } from 'mongoose';
import { EMODELS } from './models.types';

const StockUnitSchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true,
    },
});

export interface IStockUnitSchema {
    name: string;
}

export type IStockUnitModel = Model<IStockUnitSchema & Document>;

export const StockUnitModel: IStockUnitModel = model(EMODELS.STOCKUNIT, StockUnitSchema);
