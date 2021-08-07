import { Document, Schema, Types } from 'mongoose';
import { isEmpty } from 'lodash';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { SchemaService } from '../../SchemaService';
import { CONFIG } from '../../../configs/config';

/**
 * TaxBracket -> entity with single tax info ie name & rate
 * TaxGroup -> collection of two or more tax bracket together is called TaxGroup
 * TaxSetting -> both tax bracket and tax groups in one collection
 */

export const TaxSettingSchema = new Schema(
    {
        name: {
            type: Schema.Types.String,
            required: true,
            max: CONFIG.DEFAULT_MAX_TEXT_SIZE,
        },
        rate: {
            type: Schema.Types.Number,
            default: 0,
        },
        group: {
            type: [Schema.Types.ObjectId],
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXSETTING,
        },
    },
    {
        timestamps: true,
        toJSON: {
            //Arg 1 -> actual doc Arg2 -> doc to be returned
            transform(_, ret) {
                ret.id = ret._id;
                delete ret._id;
            },
            versionKey: false,
        },
    },
);

//utility property to check if current document is taxBracket / taxGroup
TaxSettingSchema.virtual('isGroup').get(function (this: ITaxSettingDoc) {
    return !isEmpty(this.group);
});

export interface ITaxSettingDoc extends Document {
    id: string;
    name: string;
    rate: number;
    group?: string[] | Omit<ITaxSettingDoc, 'group'>[];
    /**
     * isGroup - virtual to differentiate between tax bracket / tax group
     */
    isGroup?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXSETTING, TaxSettingSchema);
