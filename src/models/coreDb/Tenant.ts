import { Schema, model, Model, Document } from 'mongoose';
import { IPlugin } from './Plugin';
import { MONGOOSE_MODELS } from '..';
import { auth } from '@sellerspot/universal-functions';

/**
 * An interface that describes the properties
 * that a Tenant Document has
 * */
export interface ITenant extends Document {
    name: string;
    email: string;
    password: string;
    storeName: string;
    plugins?: string[] | IPlugin[];
    createdAt?: string;
    updatedAt?: string;
}

const TenantSchema = new Schema(
    {
        name: {
            type: Schema.Types.String,
            min: 5,
            max: 150,
            required: true,
        },
        email: {
            type: Schema.Types.String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true, //Unique Index will be created will be also helpfull for lookup
        },
        password: {
            type: Schema.Types.String,
            min: 5,
            required: true,
        },
        storeName: {
            type: Schema.Types.String,
            min: 5,
            max: 150,
            required: true,
        },
        plugins: [{ type: Schema.Types.ObjectId, ref: MONGOOSE_MODELS.CORE_DB.PLUGIN }],
    },
    {
        timestamps: true,
        toJSON: {
            //Arg 1 -> actual doc Arg2 -> doc to be returned
            transform(_, ret) {
                (ret.id = ret._id), delete ret._id;
                delete ret.password;
            },
            versionKey: false,
        },
    },
);

TenantSchema.pre('save', async function (done) {
    if (this.isModified('password')) {
        const hashed = await auth.PasswordManager.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
});

const TenantModel = model<ITenant, Model<ITenant>>(MONGOOSE_MODELS.CORE_DB.TENANT, TenantSchema);

export { TenantModel };
