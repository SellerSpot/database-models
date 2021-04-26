import { Document, model, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { ICustomer } from '../../coreDb';
import { IEmployee, IOutlet } from '../catalogueModels';

enum DiscountTypesEnum {
    VALUE = 'VALUE',
    PERCENT = 'PERCENT',
}

enum SaletatusEnum {
    PARKED = 'PARKED',
    COMPLETED = 'COMPLETED',
    VOIDED = 'VOIDED',
}

enum PaymentMethodsEnum {
    CASH = 'CASH',
    CARD = 'CARD',
}

const SaleSchema = new Schema(
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

export interface ISale extends Document {
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
    customer: string | ICustomer;
    employee: string | IEmployee;
    outlet: string | IOutlet;
    createdAt?: string;
    updatedAt?: string;
}

export const SaleModel = model<ISale>(MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.SALE, SaleSchema);
