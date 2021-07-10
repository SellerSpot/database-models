import { Document, Schema, Types } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { ICustomer } from '../../coreDb';
import { IOutletDoc, IProductDoc, IStockUnitDoc, ITaxBracketDoc } from '../catalogueModels';
import { IUserDoc } from '../User';
import { SchemaService } from '../../SchemaService';

export enum DiscountTypesEnum {
    VALUE = 'VALUE',
    PERCENT = 'PERCENT',
}

export enum SaletatusEnum {
    PARKED = 'PARKED',
    COMPLETED = 'COMPLETED',
    VOIDED = 'VOIDED',
}

export enum PaymentMethodsEnum {
    CASH = 'CASH',
    CARD = 'CARD',
}

export const SaleSchema = new Schema(
    {
        cart: [
            {
                product: {
                    name: {
                        type: Schema.Types.String,
                    },
                    reference: {
                        type: Schema.Types.ObjectId,
                        ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT,
                    },
                },
                stockUnit: {
                    name: {
                        type: Schema.Types.String,
                    },
                    reference: {
                        type: Schema.Types.ObjectId,
                        ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT,
                    },
                },
                quantity: { type: Schema.Types.Number },
                unitPrice: { type: Schema.Types.Number },
                productDiscount: { type: Schema.Types.Number },
                productDiscountType: {
                    type: Schema.Types.String,
                    enum: DiscountTypesEnum,
                },
                taxBracket: {
                    name: { type: Schema.Types.String },
                    rate: { type: Schema.Types.Number },
                    group: [
                        {
                            name: { type: Schema.Types.String },
                            rate: { type: Schema.Types.Number },
                        },
                    ],
                    reference: {
                        type: Schema.Types.ObjectId,
                        ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET,
                    },
                },
            },
        ],
        status: {
            type: Schema.Types.String,
            enum: SaletatusEnum,
        },
        saleDiscount: { type: Schema.Types.Number },
        saleDiscountType: {
            type: Schema.Types.String,
            enum: DiscountTypesEnum,
        },
        payment: {
            method: {
                type: Schema.Types.String,
                enum: PaymentMethodsEnum,
            },
            total: { type: Schema.Types.Number },
            amountPaid: { type: Schema.Types.Number },
            balance: { type: Schema.Types.Number },
        },
        customer: {
            name: {
                type: Schema.Types.String,
            },
            ref: {
                type: Schema.Types.ObjectId,
                ref: MONGOOSE_MODELS.CORE_DB.CUSTOMER,
            },
        },
        user: {
            name: {
                type: Schema.Types.String,
            },
            ref: {
                type: Schema.Types.ObjectId,
                ref: MONGOOSE_MODELS.TENANT_DB.USER,
            },
        },
        outlet: {
            name: {
                type: Schema.Types.String,
            },
            ref: {
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
        reference: Types.ObjectId | IProductDoc;
    };
    stockUnit: {
        name: string;
        reference: Types.ObjectId | IStockUnitDoc;
    };
    quantity: number;
    unitPrice: number;
    productDiscount: number;
    productDiscountType: DiscountTypesEnum;
    taxDetails: {
        name: string;
        rate: number;
        group: [
            {
                name: string;
                rate: number;
            },
        ];
        reference: Types.ObjectId | ITaxBracketDoc;
    };
}

export interface ISale {
    cart: ICartDetails[];
    status: SaletatusEnum;
    saleDiscount: number;
    saleDiscountType: DiscountTypesEnum;
    payment: {
        method: PaymentMethodsEnum;
        total: { type: Schema.Types.Number };
        amountPaid: number;
        balance: number;
    };
    customer: Types.ObjectId | ICustomer;
    user: Types.ObjectId | IUserDoc;
    outlet: string | IOutletDoc;
    id?: string;
    createdAt?: string;
    updatedAt?: string;
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.SALE, SaleSchema);
