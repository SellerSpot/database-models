/* eslint-disable @typescript-eslint/no-explicit-any */
import { DB_NAMES } from '../dbNames';
import { Connection } from 'mongoose';
import { ArgumentsType } from '../typings/common.types';
import { logger } from '@sellerspot/universal-functions';

const inferDbTypes = <T extends { [key: string]: Connection }>(arg: T): T => arg;

/**
 * contains all dbs reflections
 */
export const dbs = inferDbTypes({
    core: <Connection>null,
    tenant: <Connection>null,
});

/**
 * Intializes the database models package, hence future db service operations will use the dbs object to access corresponding databases
 *
 * @param {Connection} connectionObject - mongoose connection object
 *
 */
export const intializeDatabaseModels = (connectionObject: Connection): void => {
    dbs.core = connectionObject?.useDb(DB_NAMES.CORE_DB, { useCache: true });
};

/**
 * sets the tenantdb for the passed in tenantId (later validation should be made here)
 *
 * @param tenantId - tenantId of the tenant to set the current tenantdb in dbs object scope
 */
export const setTenantDb = (tenantId: string): void => {
    dbs.tenant = dbs?.core?.useDb(tenantId, { useCache: true });
};

/**
 * Tenant Wrapper provides the wrapper to the services which needs the current tenant db to be accessed within the scope
 *
 * @param func - function that needs the tenant wrapper (current tenantDb access provision goes throw this wrapper)
 */
export const tenantWrapper = <T extends (...args: any[]) => any>(func: T) => (
    tenantId: string,
    ...args: ArgumentsType<T>
): ReturnType<T> => {
    logger.info('Setting tenantDb for the tenant', tenantId);
    setTenantDb(tenantId);
    return func(...args);
};
