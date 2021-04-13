/* eslint-disable @typescript-eslint/no-explicit-any */
import { DB_NAMES } from '../dbNames';
import { Connection } from 'mongoose';

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
