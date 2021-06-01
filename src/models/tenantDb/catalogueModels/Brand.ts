import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { SchemaService } from '../../SchemaService';

export const BrandSchema = new Schema(
    {
        name: Schema.Types.String,
    },
    {
        timestamps: true,
    },
);

export interface IBrand extends Document {
    name: string;
    createdAt?: string;
    updatedAt?: string;
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND, BrandSchema);
