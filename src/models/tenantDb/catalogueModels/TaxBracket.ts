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
TaxBracketSchema.virtual('isGroup').get(function (this: ITaxBracket) {
    return isEmpty(this.group) ? false : true;
});

export interface ITaxBracket extends Document {
    name: string;
    rate: number;
    group: Types.ObjectId[] | ITaxBracket[];
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET, TaxBracketSchema);
