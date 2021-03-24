import { Schema, model, Model, Document, SchemaType } from 'mongoose';
import { catalogueModels } from '..';
import { coreDbModels, MONGOOSE_MODELS } from '../..';

enum DiscountTypesEnum {
    VALUE = 'VALUE',
    PERCENT = 'PERCENT',
}

enum SaletatusEnum {
    PARKER = 'PARKED',
    COMPLETED = 'COMPLETED',
    VOIDED = 'VOIDED',
}

enum PaymentMethodsEnum {
    CASH = 'CASH',
    CARD = 'CARD',
}

const Sale = new Schema(
    {
        cart: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT,
                },
                productName: Schema.Types.String,
                quantity: Schema.Types.Number,
                unitPrice: Schema.Types.Number,
                discount: Schema.Types.Number,
                discountType: {
                    type: Schema.Types.String,
                    enum: DiscountTypesEnum,
                },
                taxDetails: [
                    {
                        taxBracketId: {
                            type: Schema.Types.ObjectId,
                            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET,
                        },
                        bracketName: Schema.Types.String,
                        bracketRate: Schema.Types.Number,
                    },
                ],
            },
        ],
        status: {
            type: Schema.Types.String,
            enum: SaletatusEnum,
        },
        saleDiscount: Schema.Types.Number,
        saleDiscountType: {
            type: Schema.Types.String,
            enum: DiscountTypesEnum,
        },
        paymentDetails: {
            method: {
                type: Schema.Types.String,
                enum: PaymentMethodsEnum,
            },
            amountPaid: Schema.Types.Number,
            balance: Schema.Types.Number,
        },
        saleTotal: Schema.Types.Number,
        customer: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.CORE_DB.CUSTOMER,
        },
        employee: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.EMPLOYEE,
        },
        outlet: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.OUTLET,
        },
    },
    {
        timestamps: true,
    },
);

export interface ISale {
    _id?: string;
    cart: {
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        discount: number;
        discountType: DiscountTypesEnum;
        taxDetails: [
            {
                taxBracketId: string;
                bracketName: string;
                bracketRate: number;
            },
        ];
    }[];
    status: SaletatusEnum;
    saleDiscount: number;
    saleDiscountType: DiscountTypesEnum;
    paymentDetails: {
        method: PaymentMethodsEnum;
        amountPaid: number;
        balance: number;
    };
    saleTotal: number;
    customer: string | coreDbModels.CustomerModel.ICustomer;
    employee: string | catalogueModels.ExployeeModel.IEmployee;
    outlet: string | catalogueModels.OutletModel.IOutlet;
    createdAt?: string;
    updatedAt?: string;
}

export type ISaleModel = Model<ISale & Document>;

export const BaseModel: ISaleModel = model(MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.SALE, Sale);
