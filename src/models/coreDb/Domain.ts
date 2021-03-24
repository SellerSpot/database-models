import { Schema, model, Model, Document } from 'mongoose';
import { coreDbModels, MONGOOSE_MODELS } from '..';

const DomainSchema = new Schema(
    {
        name: Schema.Types.String,
        tenant: { type: Schema.Types.ObjectId, ref: MONGOOSE_MODELS.CORE_DB.TENANT },
        isSubDomain: Schema.Types.Boolean,
        isActive: Schema.Types.Boolean,
    },
    { timestamps: true },
);

export interface IDomain {
    name: string;
    tenant: string | coreDbModels.TenantModel.ITenant;
    isSubDomain: boolean;
    isActive: boolean;
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type IDomainModel = Model<IDomain & Document>;

export const DomainModel: IDomainModel = model(MONGOOSE_MODELS.CORE_DB.DOMAIN, DomainSchema);
