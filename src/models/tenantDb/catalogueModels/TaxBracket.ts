import { Document, Schema } from 'mongoose';
import { ITaxBracketData } from '../../../../.yalc/@sellerspot/universal-types/dist';
import { CONFIG } from '../../../configs/config';
import { SchemaService } from '../../SchemaService';
import { MONGOOSE_MODELS } from '../../mongooseModels';

/**
 * TaxBracket -> entity with single tax info ie name & rate
 * TaxGroup -> collection of two or more tax bracket together is called TaxGroup
 * AllTaxBrackets -> both tax bracket and tax groups in one collection
 */

export const TaxBracketchema = new Schema(
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
        // holds all the tax brackets if the current taxBracket is a group
        group: {
            type: [Schema.Types.ObjectId],
            ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET,
            default: undefined,
        },
    },
    {
        timestamps: true,
    },
);

export type ITaxBracketDoc = ITaxBracketData & Document;

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET, TaxBracketchema);
