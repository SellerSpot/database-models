import { Connection } from 'mongoose';
import { DB_NAMES } from '../dbNames';
export class DbConnectionManager {
    private static _core: Connection;
    private static _tenant: Connection;

    public static intialize(conn: Connection): void {
        DbConnectionManager._core = conn?.useDb(DB_NAMES.CORE_DB, { useCache: true });
    }

    public static setTenantDb = (tenantId: string): void => {
        DbConnectionManager._tenant = DbConnectionManager._core?.useDb(tenantId, {
            useCache: true,
        });
    };

    public static getCoreDb(): Connection {
        return DbConnectionManager._core;
    }

    public static getTenantDb(): Connection {
        return DbConnectionManager._tenant;
    }
}