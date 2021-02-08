import { Document, Model, Schema, Types, model } from 'mongoose';
import { ITenant } from './Tenant';
import { MONGOOSE_MODELS } from '..';

const SubDomainSchema = new Schema(
    {
        domainName: String,
        tenant: { type: Schema.Types.ObjectId, ref: MONGOOSE_MODELS.BASE_DB.TENANT },
    },
    { timestamps: true },
);

export interface ISubDomain {
    domainName: string;
    tenant: string | ITenant;
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type ISubDomainModel = Model<ISubDomain & Document>;

export const SubDomainModel: ISubDomainModel = model(
    MONGOOSE_MODELS.BASE_DB.SUB_DOMAIN,
    SubDomainSchema,
);
