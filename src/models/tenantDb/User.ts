import { auth, logger } from '@sellerspot/universal-functions';
import { Document, Schema } from 'mongoose';
import { CONFIG } from '../../configs/config';
import { MONGOOSE_MODELS } from '../mongooseModels';
import { SchemaService } from '../SchemaService';

export const UserSchema = new Schema(
    {
        name: {
            type: Schema.Types.String,
            min: CONFIG.DEFAULT_MIN_TEXT_SIZE,
            max: CONFIG.DEFAULT_MAX_TEXT_SIZE,
            required: true,
        },
        email: {
            type: Schema.Types.String,
            lowercase: true,
            index: true,
            trim: true,
        },
        password: {
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
                delete ret.password;
            },
            versionKey: false,
        },
    },
);

UserSchema.pre('save', async function (done) {
    if (this.isModified('password')) {
        logger.info(`password is modified hence rehashing`);
        const hashed = await auth.PasswordManager.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
});

export interface IUser {
    name: string;
    email?: string;
    password: string;
}

//methods in model can be added here
export interface IUserDoc extends IUser, Document {}

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.USER, UserSchema);
