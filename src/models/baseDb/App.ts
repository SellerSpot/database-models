import { Schema, model, Model, Document, Types } from 'mongoose';
import { MONGOOSE_MODELS } from 'models/models';

const AppSchema = new Schema(
    {
        name: String,
        slug: String,
        dbName: String,
        shortDescription: String,
        longDescription: String,
        iconUrl: String,
        bannerImages: [
            {
                type: String,
            },
        ],
        domainName: String,
    },
    { timestamps: true },
);

export interface IApp {
    name: string;
    shortDescription: string;
    longDescription: string;
    iconUrl: string;
    bannerImages: string[];
    domainName: string;
    _id?: string | Types.ObjectId;
    slug?: string;
    dbName?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type IAppModel = Model<IApp & Document>;

export const AppModel: IAppModel = model(MONGOOSE_MODELS.BASE_DB.APP, AppSchema);
