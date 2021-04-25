import { logger, ServerError } from '@sellerspot/universal-functions';
import { ERROR_CODE } from '@sellerspot/universal-types';
import { RequestHandler } from 'express';
import { DbConnectionManager } from '../config/initializer';

/**
 * Sets tenant db based on tenant id
 * <b>Make sure to run auth middleware before running this</b>
 */
export const setTenantDb: RequestHandler = (req, _, next): void => {
    if (req?.currentTenant.id) {
        DbConnectionManager.setTenantDb(req.currentTenant.id);
        logger.info(`Db ${req.currentTenant.id} is set`);
        return next();
    }
    throw new ServerError(ERROR_CODE.DB_FAILURE, 'Cannot set tenant db');
};
