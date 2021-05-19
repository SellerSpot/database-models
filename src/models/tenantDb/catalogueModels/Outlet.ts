import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { MODEL_NAME_VS_SCHEMA } from '../../schemaMap';

export const OutletSchema = new Schema(
    {
        name: Schema.Types.String,
        address: Schema.Types.String,
    },
    {
        timestamps: true,
    },
);

export interface IOutlet extends Document {
    name: string;
    address: string;
}

MODEL_NAME_VS_SCHEMA.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.OUTLET, OutletSchema);
