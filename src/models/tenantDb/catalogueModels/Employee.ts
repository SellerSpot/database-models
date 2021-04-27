import { Document, model, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';

const EmployeeSchema = new Schema(
    {
        name: Schema.Types.String,
        employeeId: Schema.Types.String,
        password: Schema.Types.String,
    },
    {
        timestamps: true,
    },
);

export interface IEmployee extends Document {
    name: string;
    employeeId: string;
    password: string;
}

export const EmployeeModel = model<IEmployee>(
    MONGOOSE_MODELS.TENANT_DB.CATALOGUE.EMPLOYEE,
    EmployeeSchema,
);
