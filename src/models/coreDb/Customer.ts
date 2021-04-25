import { Document, model, Schema } from 'mongoose';
import { MONGOOSE_MODELS } from '..';

export interface ICustomer extends Document {
    name: string;
}

const CustomerSchema = new Schema(
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

const CustomerModel = model<ICustomer>(MONGOOSE_MODELS.CORE_DB.CUSTOMER, CustomerSchema);

export { CustomerModel };
