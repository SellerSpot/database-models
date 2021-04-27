import { Document, model, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../mongooseModels';
import { ITenant } from '../coreDb/Tenant';

const TenantHandshakeSchema = new Schema(
    {
        name: { type: Schema.Types.String, required: true },
        storeName: { type: Schema.Types.String, required: true },
        email: { type: Schema.Types.String, required: true }, // email and name could be get from basedb.tenant collection , it is included here for meta
        tenant: { type: Schema.Types.ObjectId, ref: MONGOOSE_MODELS.CORE_DB.TENANT },
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

export interface ITenantHandshake extends Document {
    name: string;
    storeName: string;
    email: string;
    tenant: string | ITenant;
}

export const TenantHandshakeModel = model<ITenantHandshake>(
    MONGOOSE_MODELS.TENANT_DB.TENANT_HANDSHAKE,
    TenantHandshakeSchema,
);
