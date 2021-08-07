import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { SchemaService } from '../../SchemaService';

export interface IBrandDoc extends Document {
    id: string;
    name: string;
    createdAt?: string;
    updatedAt?: string;
}

export const BrandSchema = new Schema(
    {
        name: { type: Schema.Types.String },
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

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND, BrandSchema);
