import { Schema, model, Model, Document } from 'mongoose';
import { MONGOOSE_MODELS } from '..';

const CustomerSchema = new Schema(
    {
        name: Schema.Types.String,
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

export const CustomerModel: ICustomerModel = model(MONGOOSE_MODELS.CORE_DB.DOMAIN, CustomerSchema);
