import { Document, Schema, Types } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { ICustomerDoc } from '../../coreDb';
import { IOutletDoc, IProductDoc, IStockUnitDoc, ITaxSettingDoc } from '../catalogueModels';
import { IUserDoc } from '../User';
import { SchemaService } from '../../SchemaService';
import { EDiscountTypes, EPaymentMethods, ESaleStatus } from '@sellerspot/universal-types';

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
                ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXSETTING,
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
                ref: MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.OUTLET,
            },
        },
    },
    {
        timestamps: true,
    },
);

export interface ICartDetails {
    product: {
        name: string;
        reference: Schema.Types.ObjectId | IProductDoc;
    };
    stockUnit: {
        name: string;
        reference: Schema.Types.ObjectId | IStockUnitDoc;
    };
    quantity: number;
    unitPrice: number; // should we need isModified flag?
    productDiscount: {
        discount: number;
        discountType: EDiscountTypes;
    };
    taxBracket: {
        name: string;
        rate: number;
        group?: [
            {
                name: string;
                rate: number;
            },
        ];
        reference: Schema.Types.ObjectId | ITaxSettingDoc;
    };
}

export interface ISaleDoc extends Document {
    cart: ICartDetails[];
    status: ESaleStatus;
    saleDiscount: {
        discount: number;
        discountType: EDiscountTypes;
    };
    payment: {
        method: EPaymentMethods;
        // all products discount and including total sale discount
        totalDiscount: number;
        // all products consolidated taxes
        totalTax: number;
        // total before applying tax and discount
        subTotal: number;
        // total after applying tax and discount
        grandTotal: number;
        // amount paid by the customer
        amountPaid: number;
        // balance given to the customer
        balanceGiven: number;
        // need to incorporate due schema here in next phase
    };
    // client / customer
    customer: {
        name: string;
        reference: Schema.Types.ObjectId | ICustomerDoc;
    };
    // employee / owner
    user: {
        name: string;
        reference: Schema.Types.ObjectId | IUserDoc;
    };
    outlet: {
        name: string;
        reference: Schema.Types.ObjectId | IOutletDoc;
    };
    createdAt?: string;
    updatedAt?: string;
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.SALE, SaleSchema);
