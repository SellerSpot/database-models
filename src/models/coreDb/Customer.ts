import { Document, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '../mongooseModels';
import { MODEL_NAME_VS_SCHEMA } from '../schemaMap';

export interface ICustomer extends Document {
    name: string;
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

MODEL_NAME_VS_SCHEMA.set(MONGOOSE_MODELS.CORE_DB.CUSTOMER, CustomerSchema);
