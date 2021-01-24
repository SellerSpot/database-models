import { Schema, model, Model, Document } from 'mongoose';
import { MONGOOSE_MODELS, baseDbModels } from '..';

const TenantSchema = new Schema({
    name: String,
    email: String,
    password: String,
    subDomain: { type: Schema.Types.ObjectId, ref: MONGOOSE_MODELS.BASE_DB.TENANT },
    apps: [{ type: Schema.Types.ObjectId, ref: MONGOOSE_MODELS.BASE_DB.APP }], // this will just hold the basic ref of apps, all detailed thing will inside the tenantDb
});

export interface ITenant {
    name: string;
    email: string;
    password: string;
    subDomain?: string | baseDbModels.SubDomainModel.ISubDomain;
    apps?: string[] | baseDbModels.AppModel.IApp[];
}

export type ITenantModel = Model<ITenant & Document>;

export const TenantModel: ITenantModel = model(MONGOOSE_MODELS.BASE_DB.TENANT, TenantSchema);
