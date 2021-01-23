import { Schema, model, Model, Document } from 'mongoose';
import { MONGOOSE_MODELS } from '../models';

const SubDomainSchema = new Schema(
    {
        domainName: String,
        tenantId: { type: Schema.Types.ObjectId, ref: MONGOOSE_MODELS.BASE_DB.TENANT },
    },
    { timestamps: true },
);

export interface ISubDomain {
    domainName: string;
    tenantId: string;
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type ISubDomainModel = Model<ISubDomain & Document>;

export const SubDomainModel: ISubDomainModel = model(
    MONGOOSE_MODELS.BASE_DB.SUB_DOMAIN,
    SubDomainSchema,
);
