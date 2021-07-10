import { IUserDoc } from '../../models/tenantDb';
import { DbConnectionManager } from '../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../models';
import { LeanDocument } from 'mongoose';

/**
 * No validation check will be done, should be called by in create
 * tenant flow only email will be read from tenant doc
 */
export const createDefaultUser = async (userDetails: LeanDocument<IUserDoc>): Promise<IUserDoc> => {
    const { name, password, email } = userDetails;
    const User = DbConnectionManager.getTenantModel<IUserDoc>(MONGOOSE_MODELS.TENANT_DB.USER);
    const rootUser = await User.create({ email, name, password });
    return rootUser;
};

export const getUserByEmail = async (email: string): Promise<IUserDoc> => {
    const User = DbConnectionManager.getTenantModel<IUserDoc>(MONGOOSE_MODELS.TENANT_DB.USER);
    return await User.findOne({ email });
};

export const getUserById = async (userId: string): Promise<IUserDoc> => {
    const User = DbConnectionManager.getTenantModel<IUserDoc>(MONGOOSE_MODELS.TENANT_DB.USER);
    const user = await User.findById(userId);
    return user;
};
