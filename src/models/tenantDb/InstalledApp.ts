import { Schema, model, Model, Document } from 'mongoose';
import { MONGOOSE_MODELS } from 'models/models';

const InstalledAppSchema = new Schema(
    {
        app: { type: Schema.Types.ObjectId, ref: MONGOOSE_MODELS.BASE_DB.APP },
        // later it will contain list of feature enabled for particular app and also list of installed plugins and expiry kind of thing
    },
    { timestamps: true },
);

export interface IInstalledApp {
    app: string;
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type IInstalledAppModel = Model<IInstalledApp & Document>;

export const InstalledAppModel: IInstalledAppModel = model(
    MONGOOSE_MODELS.TENANT_DB.INSTAllED_APP,
    InstalledAppSchema,
);
