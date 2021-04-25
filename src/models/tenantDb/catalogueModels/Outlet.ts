import { Document, model, Model, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../..';

const Outlet = new Schema(
    {
        name: Schema.Types.String,
        address: Schema.Types.String,
    },
    {
        timestamps: true,
    },
);

export interface IOutlet {
    _id?: string;
    name: string;
    address: string;
    createdAt?: string;
    updatedAt?: string;
}

export type IOutletModel = Model<IOutlet & Document>;

export const BaseModel: IOutletModel = model(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.OUTLET, Outlet);
