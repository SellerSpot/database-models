import { Document, Schema, Types } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { SchemaService } from '../../SchemaService';
import { CONFIG } from '../../../configs/config';
import { isEmpty } from 'lodash';

/**
 * TaxBracket -> entity with single tax info ie name & rate
 * TaxGroup -> collection of two or more tax bracket together is called TaxGroup
 */

export const TaxBracketSchema = new Schema(
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
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET,
        },
    },
    {
        timestamps: true,
    },
);

//utility property to check if current document is taxBracket / taxGroup
TaxBracketSchema.virtual('isGroup').get(function (this: ITaxBracketDoc) {
    return !isEmpty(this.group);
});

export interface ITaxBracketDoc extends Document {
    id: string;
    name: string;
    rate: number;
    group?: string[] | ITaxBracketDoc[];
    /**
     * isGroup - virtual to differentiate between tax bracket / tax group
     */
    isGroup?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET, TaxBracketSchema);
