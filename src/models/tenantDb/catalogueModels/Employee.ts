import { Schema, model, Model, Document } from 'mongoose';
import { MONGOOSE_MODELS } from '../..';

const Employee = new Schema(
    {
        name: Schema.Types.String,
        employeeId: Schema.Types.String,
        password: Schema.Types.String,
    },
    {
        timestamps: true,
    },
);

export interface IEmployee {
    _id?: string;
    name: string;
    employeeId: string;
    password: string;
    createdAt?: string;
    updatedAt?: string;
}

export type IEmployeeModel = Model<IEmployee & Document>;

export const BaseModel: IEmployeeModel = model(
    MONGOOSE_MODELS.TENANT_DB.CATALOGUE.EMPLOYEE,
    Employee,
);
