import { Document, Schema } from 'mongoose';
import { ITenantCustomerData } from '@sellerspot/universal-types';
import { CONFIG } from '../../configs/config';
import { MONGOOSE_MODELS } from '../mongooseModels';
import { SchemaService } from '../SchemaService';

export const CustomerSchema = new Schema(
    {
        name: {
            type: Schema.Types.String,
            min: CONFIG.DEFAULT_MIN_TEXT_SIZE,
            max: CONFIG.DEFAULT_MAX_TEXT_SIZE,
            index: true,
            required: true,
        },
        mobile: {
            type: Schema.Types.String,
            index: true,
            trim: true,
            required: true,
        },
        email: {
            type: Schema.Types.String,
            lowercase: true,
            index: true,
            trim: true,
        },
        billingAddress: {
            type: Schema.Types.String,
        },
        shippingAddress: {
            type: Schema.Types.String,
        },
        GSTN: {
            type: Schema.Types.String,
        },
    },
    {
        timestamps: true,
    },
);

export type ICustomerDoc = ITenantCustomerData & Document;

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CUSTOMER, CustomerSchema);
