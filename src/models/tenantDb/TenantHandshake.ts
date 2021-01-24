import { Schema, model, Model, Document } from 'mongoose';
import { baseDbModels, MONGOOSE_MODELS } from '..';

// this will be the first collection created when a tenant creates a account.

const TenantHandshake = new Schema(
    {
        email: String,
        name: String,
        tenant: { type: Schema.Types.ObjectId, ref: MONGOOSE_MODELS.BASE_DB.TENANT },
    },
    {
        timestamps: true,
    },
);

export interface ITenantHandshake {
    email: string;
    name: string;
    tenant: string | baseDbModels.TenantModel.ITenant;
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type ITenantHandshakeModel = Model<ITenantHandshake & Document>;

export const BaseModel: ITenantHandshakeModel = model(
    MONGOOSE_MODELS.TENANT_DB.TENANT_HANDSHAKE,
    TenantHandshake,
);
