import { Document, Schema } from 'mongoose';
import { EBILL_SIZES, IBillSettings } from '@sellerspot/universal-types';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { SchemaService } from '../../SchemaService';

export enum EPOSInfoType {
    BILL_SETTINGS = 'BILL_SETTINGS',
}

export const BillSettingsSchema = new Schema(
    {
        defaultBill: {
            type: Schema.Types.String,
            enum: EBILL_SIZES,
        },
        bills: {
            [EBILL_SIZES.BILL_A4]: {
                storeDetails: {
                    name: Schema.Types.String,
                    address: Schema.Types.String,
                },
                GSTNumber: {
                    show: Schema.Types.Boolean,
                    data: Schema.Types.String,
                },
                purchaseInvoiceSection: {
                    show: Schema.Types.Boolean,
                    discountColumn: Schema.Types.Boolean,
                    taxColumn: Schema.Types.Boolean,
                    MRPColumn: Schema.Types.Boolean,
                },
                purchaseSummarySection: {
                    totalDiscount: Schema.Types.Boolean,
                    youSaved: Schema.Types.Boolean,
                },
                taxSplitUpSection: {
                    show: Schema.Types.Boolean,
                },
                remarkMessage: {
                    show: Schema.Types.Boolean,
                    data: Schema.Types.String,
                },
                termsAndConditions: {
                    show: Schema.Types.Boolean,
                    data: Schema.Types.String,
                },
                signature: {
                    authorised: Schema.Types.Boolean,
                    customer: Schema.Types.Boolean,
                },
                footerMessage: {
                    show: Schema.Types.Boolean,
                    data: Schema.Types.String,
                },
            },
            [EBILL_SIZES.BILL_90MM]: {
                storeDetails: {
                    name: Schema.Types.String,
                    address: Schema.Types.String,
                },
                footerMessage: {
                    show: Schema.Types.Boolean,
                    data: Schema.Types.String,
                },
            },
        },
    },
    { _id: false, versionKey: false },
);

export const InfoSchema = new Schema(
    {
        infoType: {
            type: Schema.Types.String,
            enum: EPOSInfoType,
        },
        [EPOSInfoType.BILL_SETTINGS]: BillSettingsSchema,
    },
    {
        timestamps: true,
    },
);

export interface IInfoDoc extends Document {
    id: string;
    infoType: EPOSInfoType;
    [EPOSInfoType.BILL_SETTINGS]?: IBillSettings;
    createdAt?: string;
    updatedAt?: string;
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.INFO, InfoSchema);
