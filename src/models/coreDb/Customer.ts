import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../mongooseModels';
import { SchemaService } from '../SchemaService';

export interface ICustomer extends Document {
    name: string;
    createdAt?: string;
    updatedAt?: string;
}

export const CustomerSchema = new Schema(
    {
        name: {
            type: Schema.Types.String,
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            //Arg 1 -> actual doc Arg2 -> doc to be returned
            transform(_, ret) {
                (ret.id = ret._id), delete ret._id;
            },
            versionKey: false,
        },
    },
);

SchemaService.set(MONGOOSE_MODELS.CORE_DB.CUSTOMER, CustomerSchema);
