import { Document, model, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../mongooseModels';
import { ITenant } from './Tenant';

export interface IDomain extends Document {
    name: string;
    tenant: string | ITenant;
    isCustom: boolean;
    isActive: boolean;
    isReserved: boolean;
    createdAt?: string;
    updatedAt?: string;
}

const DomainSchema = new Schema(
    {
        name: {
            type: Schema.Types.String,
            required: true,
        },
        tenant: { type: Schema.Types.ObjectId, ref: MONGOOSE_MODELS.CORE_DB.TENANT },
        isCustom: {
            type: Schema.Types.Boolean,
            default: false,
        },
        isActive: {
            type: Schema.Types.Boolean,
            default: true,
        },
        isReserved: {
            type: Schema.Types.Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            //Arg 1 -> actual doc Arg2 -> doc to be returned
            transform(_, ret) {
                (ret.id = ret._id), delete ret._id;
            },
            versionKey: false,
        },
    },
);

export const DomainModel = model<IDomain>(MONGOOSE_MODELS.CORE_DB.DOMAIN, DomainSchema);
