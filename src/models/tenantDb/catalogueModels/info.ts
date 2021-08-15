import { Document, Schema } from 'mongoose';
import { IOutletSettingData } from '@sellerspot/universal-types';
import { SchemaService } from '../../SchemaService';
import { MONGOOSE_MODELS } from '../..';

export enum ECatalogueInfoType {
    OUTLET_SETTINGS = 'OUTLET_SETTINGS',
}

const OutletSetttingsSchema = new Schema(
    {
        defaultOutlet: {
            type: Schema.Types.ObjectId,
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.OUTLET,
        },
    },
    {
        _id: false,
    },
);

export const InfoSchema = new Schema(
    {
        infoType: {
            type: Schema.Types.String,
            enum: ECatalogueInfoType,
        },
        [ECatalogueInfoType.OUTLET_SETTINGS]: OutletSetttingsSchema,
    },
    { timestamps: true },
);

export interface IInfoDoc extends Document {
    id: string;
    infoType: ECatalogueInfoType;
    [ECatalogueInfoType.OUTLET_SETTINGS]?: IOutletSettingData;
    createdAt?: string;
    updatedAt?: string;
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.INFO, InfoSchema);
