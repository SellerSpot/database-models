import { Schema, model, Model, Document } from 'mongoose';
import { MONGOOSE_MODELS, baseDbModels } from '..';

const TenantSchema = new Schema(
    {
        name: String,
        email: String,
        password: String,
        storeName: String,
        domains: [{ type: Schema.Types.ObjectId, ref: MONGOOSE_MODELS.BASE_DB.DOMAIN }],
        plugins: [{ type: Schema.Types.ObjectId, ref: MONGOOSE_MODELS.BASE_DB.PLUGIN }],
    },
    {
        timestamps: true,
    },
);

export interface ITenant {
    name: string;
    email: string;
    password: string;
    storeName: string;
    domains?: string[] | baseDbModels.DomainModel.IDomain[];
    plugins?: string[] | baseDbModels.PluginModel.IPlugin[];
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type ITenantModel = Model<ITenant & Document>;

export const TenantModel: ITenantModel = model(MONGOOSE_MODELS.BASE_DB.TENANT, TenantSchema);
