import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../mongooseModels';
import { SchemaService } from '../SchemaService';

export interface IStoreCurrency {
    name: string;
    code: string;
    symbol: string;
    /**
     * custom id should be passed
     */
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type IStoreCurrencyDoc = IStoreCurrency & Document;

export const StoreCurrencySchema = new Schema(
    {
        _id: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        name: {
            type: Schema.Types.String,
            required: true,
            unique: true,
        },
        code: {
            type: Schema.Types.String,
            required: true,
            unique: true,
        },
        symbol: {
            type: Schema.Types.String,
            required: true,
        },
    },
    {
        timestamps: true,
        _id: false,
    },
);

SchemaService.set(MONGOOSE_MODELS.CORE_DB.STORE_CURRENCY, StoreCurrencySchema);
