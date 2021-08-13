import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import {
    EDiscountTypes,
    EPaymentMethods,
    ESaleStatus,
    ISaleData,
} from '@sellerspot/universal-types';
import { SchemaService } from '../../SchemaService';

export const CartSchema = new Schema(
    {
        product: {
            name: Schema.Types.String,
            reference: {
                type: Schema.Types.ObjectId,
                ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT,
            },
        },
        stockUnit: {
            name: Schema.Types.String,
            reference: {
                type: Schema.Types.ObjectId,
                ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT,
            },
        },
        quantity: Schema.Types.Number,
        unitPrice: Schema.Types.Number, // should we need isModified flag?
        productDiscount: {
            discount: Schema.Types.Number,
            discountType: {
                type: Schema.Types.String,
                enum: EDiscountTypes,
            },
        },
        taxBracket: {
            name: Schema.Types.String,
            rate: Schema.Types.Number,
            group: [
                {
                    name: Schema.Types.String,
                    rate: Schema.Types.Number,
                },
            ],
            reference: {
                type: Schema.Types.ObjectId,
                ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET,
            },
        },
    },
    { versionKey: false, _id: false },
);

export const SaleSchema = new Schema(
    {
        cart: [CartSchema],
        status: {
            type: Schema.Types.String,
            enum: ESaleStatus,
        },
        /**
         * overall discount - special discount / different from individual product discount
         */
        saleDiscount: {
            discount: Schema.Types.Number,
            discountType: {
                type: Schema.Types.String,
                enum: EDiscountTypes,
            },
        },
        payment: {
            method: {
                type: Schema.Types.String,
                enum: EPaymentMethods,
            },
            // all products discount and including total sale discount
            totalDiscount: { type: Schema.Types.Number },
            // all products consolidated taxes
            totalTax: { type: Schema.Types.Number },
            // total before applying tax and discount
            subTotal: { type: Schema.Types.Number },
            // total after applying tax and discount
            grandTotal: { type: Schema.Types.Number },
            // amount paid by the customer
            amountPaid: { type: Schema.Types.Number },
            // balance given to the customer
            balance: { type: Schema.Types.Number },
        },
        // client / customer
        customer: {
            name: Schema.Types.String,
            reference: {
                type: Schema.Types.ObjectId,
                ref: MONGOOSE_MODELS.CORE_DB.CUSTOMER,
            },
        },
        // employee / owner
        user: {
            name: Schema.Types.String,
            reference: {
                type: Schema.Types.ObjectId,
                ref: MONGOOSE_MODELS.TENANT_DB.USER,
            },
        },
        outlet: {
            name: Schema.Types.String,
            reference: {
                type: Schema.Types.ObjectId,
                ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.OUTLET,
            },
        },
    },
    {
        timestamps: true,
    },
);

export type ISaleDoc = ISaleData & Document;

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.SALE, SaleSchema);
