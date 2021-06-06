import { DbConnectionManager } from '../../configs/DbConnectionManager';

export const deleteTenantDb = async (): Promise<void> => {
    return await DbConnectionManager.deleteTenantDb();
};
