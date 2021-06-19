import { IUser } from '../../models/tenantDb';
import { ITenant } from '../../models/coreDb/Tenant';
import { DbConnectionManager } from '../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../models';
import { LeanDocument } from 'mongoose';

/**
 * No validation check will be done, should be called by in create
 * tenant flow only email will be read from tenant doc
 */
export const createDefaultUser = async (userDetails: LeanDocument<IUser>): Promise<IUser> => {
    const { name, password, email } = userDetails;
    const User = DbConnectionManager.getTenantModel<IUser>(MONGOOSE_MODELS.TENANT_DB.USER);
    const rootUser = await User.create({ email, name, password });
    return rootUser;
};

export const getUserByEmail = async (email: string): Promise<IUser> => {
    const User = DbConnectionManager.getTenantModel<IUser>(MONGOOSE_MODELS.TENANT_DB.USER);
    return await User.findOne({ email });
};

export const getUserById = async (userId: string): Promise<IUser> => {
    const User = DbConnectionManager.getTenantModel<IUser>(MONGOOSE_MODELS.TENANT_DB.USER);
    const user = await User.findById(userId);
    return user;
};
