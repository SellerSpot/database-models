import { AuthUtil } from '@sellerspot/universal-functions';
import { DbConnectionManager } from '../../configs/DbConnectionManager';

export const deleteTenantDb = async (): Promise<void> => {
    return await DbConnectionManager.deleteTenantDb(AuthUtil.getCurrentTenantId());
};
