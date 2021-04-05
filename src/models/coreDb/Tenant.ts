import { Schema, model, Model, Document } from 'mongoose';
import { MONGOOSE_MODELS, coreDbModels } from '..';

const TenantSchema = new Schema(
    {
        name: Schema.Types.String,
        email: Schema.Types.String,
        password: Schema.Types.String,
        storeName: Schema.Types.String,
        plugins: [{ type: Schema.Types.ObjectId, ref: MONGOOSE_MODELS.CORE_DB.PLUGIN }],
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
    plugins?: string[] | coreDbModels.PluginModel.IPlugin[];
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type ITenantModel = Model<ITenant & Document>;

export const TenantModel: ITenantModel = model(MONGOOSE_MODELS.CORE_DB.TENANT, TenantSchema);
