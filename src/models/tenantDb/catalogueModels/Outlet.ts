import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { SchemaService } from '../../SchemaService';

export const OutletSchema = new Schema(
    {
        name: Schema.Types.String,
        address: Schema.Types.String,
        default: {
            default: false,
            type: Schema.Types.Boolean,
        },
    },
    {
        timestamps: true,
    },
);

export interface IOutletDoc extends Document {
    name: string;
    address: string;
    default?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.OUTLET, OutletSchema);
