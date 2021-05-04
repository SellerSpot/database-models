import { IUser, IUserDoc } from '../../models/tenantDb';
import { ITenantDoc } from '../../models/coreDb/Tenant';
import { DbConnectionManager } from '../../configs/initializer';
import { MONGOOSE_MODELS } from '../../models';
import { isEmpty } from 'lodash';

/**
 * No validation check will be done, should be called by in create
 * tenant flow only email will be read from tenant doc
 */
export const createDefaultUser = async (
    userDetails: IUser,
    tenantDoc: ITenantDoc,
): Promise<IUserDoc> => {
    const { name, password } = userDetails;
    const { primaryEmail, id } = tenantDoc;
    isEmpty(DbConnectionManager.getTenantDb()) && DbConnectionManager.setTenantDb(id);
    const User = DbConnectionManager.getTenantModel<IUserDoc>(MONGOOSE_MODELS.TENANT_DB.USER);
    const rootUser = await User.create({ email: primaryEmail, name, password });
    return rootUser;
};

export const getUserByEmail = async (email: string): Promise<IUserDoc> => {
    const User = DbConnectionManager.getTenantModel<IUserDoc>(MONGOOSE_MODELS.TENANT_DB.USER);
    return await User.findOne({ email }).exec();
};
