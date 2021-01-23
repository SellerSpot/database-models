import { Schema, model, Model, Document } from 'mongoose';
import { MONGOOSE_MODELS, baseDbModels } from 'models/models';

const DetailSchema = new Schema(
    {
        app: { type: Schema.Types.ObjectId, ref: MONGOOSE_MODELS.BASE_DB.APP },
        // we could add some additional properties later.
    },
    { timestamps: true },
);

export interface IDetail {
    app: string | baseDbModels.AppModel.IApp;
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type IDetailModel = Model<IDetail & Document>;

export const DetailModel: IDetailModel = model(MONGOOSE_MODELS.APP_DB.DETAIL, DetailSchema);
