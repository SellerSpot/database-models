import { Schema, model, Model, Document } from 'mongoose';
import { baseDbModels, MONGOOSE_MODELS } from '..';

const DomainSchema = new Schema(
    {
        name: String,
        tenant: { type: Schema.Types.ObjectId, ref: MONGOOSE_MODELS.BASE_DB.TENANT },
        isSubDomain: Boolean,
        isActive: Boolean,
    },
    { timestamps: true },
);

export interface IDomain {
    name: string;
    tenant: string | baseDbModels.TenantModel.ITenant;
    isSubDomain: boolean;
    isActive: boolean;
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type IDomainModel = Model<IDomain & Document>;

export const DomainModel: IDomainModel = model(MONGOOSE_MODELS.BASE_DB.DOMAIN, DomainSchema);
