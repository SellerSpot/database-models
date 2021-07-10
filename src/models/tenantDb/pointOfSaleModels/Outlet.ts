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

export interface IOutletDoc extends Document {
    id: string;
    name: string;
    address: string;
    createdAt?: string;
    updatedAt?: string;
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.OUTLET, OutletSchema);
