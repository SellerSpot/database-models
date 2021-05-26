import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { SchemaService } from '../../SchemaService';

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

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.OUTLET, OutletSchema);
