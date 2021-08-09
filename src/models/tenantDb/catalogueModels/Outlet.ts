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

export interface IOutletDoc extends Document {
    name: string;
    address: string;
    default?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.OUTLET, OutletSchema);
