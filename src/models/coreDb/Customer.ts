import { Schema, model, Model, Document } from 'mongoose';
import { MONGOOSE_MODELS } from '..';

const CustomerSchema = new Schema(
    {
        name: String,
    },
    { timestamps: true },
);

export interface ICustomer {
    name: string;
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type ICustomerModel = Model<ICustomer & Document>;

export const CustomerModel: ICustomerModel = model(MONGOOSE_MODELS.BASE_DB.DOMAIN, CustomerSchema);