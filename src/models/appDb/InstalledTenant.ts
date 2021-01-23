import { Schema, model, Model, Document } from 'mongoose';
import { MONGOOSE_MODELS } from '../models';

const InstalledTenantSchema = new Schema(
    {
        // we just maintaing list of installed tenants here all other app conifguraiton will be inside of individual tenant db
        tenant: { type: Schema.Types.ObjectId, ref: MONGOOSE_MODELS.BASE_DB.TENANT },
    },
    { timestamps: true },
);

export interface IInstalledTenant {
    tenant: string;
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type IInstalledTenantModel = Model<IInstalledTenant & Document>;

export const InstalledTenantModel: IInstalledTenantModel = model(
    MONGOOSE_MODELS.APP_DB.INSTALLED_TENANT,
    InstalledTenantSchema,
);
