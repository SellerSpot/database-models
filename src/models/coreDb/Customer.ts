import { Document, Schema } from 'mongoose';
import { CONFIG } from '../../configs/config';
import { MONGOOSE_MODELS } from '../mongooseModels';
import { SchemaService } from '../SchemaService';

export const CustomerSchema = new Schema(
    {
        name: {
            type: Schema.Types.String,
            min: CONFIG.DEFAULT_MIN_TEXT_SIZE,
            max: CONFIG.DEFAULT_MAX_TEXT_SIZE,
            required: true,
        },
        email: {
            type: Schema.Types.String,
            lowercase: true,
            index: true,
            trim: true,
        },
        mobile: {
            type: Schema.Types.Number,
        },
        address: {
            type: Schema.Types.String,
        },
        password: {
            type: Schema.Types.String,
        },
    },
    {
        timestamps: true,
    },
);
export interface ICustomerDoc extends Document {
    name: string;
    mobile: string;
    email: string;
    address: string;
    createdAt?: string;
    updatedAt?: string;
}

SchemaService.set(MONGOOSE_MODELS.CORE_DB.CUSTOMER, CustomerSchema);
