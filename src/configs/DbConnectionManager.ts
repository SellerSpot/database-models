import { Connection, Document, Model } from 'mongoose';
import { AuthUtil } from '@sellerspot/universal-functions';
import { SchemaService } from '../models/SchemaService';

export class DbConnectionManager {
    private static _core: Connection;

    public static intialize(conn: Connection): void {
        DbConnectionManager._core = conn;
    }

    private static getCoreDb(): Connection {
        return DbConnectionManager._core;
    }

    private static getTenantDb(tenantId?: string): Connection {
        const currTenantId = AuthUtil.getCurrentTenantId();
        if (!tenantId && !currTenantId) return null;
        // **** risk of core_db is being sent as an response, if tenantId is invalid ****
        return DbConnectionManager._core?.useDb(tenantId ?? currTenantId, {
            useCache: true,
            /**
             * By defualt there will be EventEmitter be attaced to parent connection, which shoot up memory usage
             * check out for more {@link https://github.com/Automattic/mongoose/issues/9961}
             */
            noListener: true,
        });
    }

    /**
     * @typeparam T generic should extends Document and should be passed
     * @param modelName
     * @returns {Model<T>}
     */
    public static getTenantModel<T extends Document>(modelName: string): Model<T> {
        const schema = SchemaService.get(modelName);
        let modal: Model<T>;
        // try catch to solve the modal re-register bug (by only reinitializing if not already initialized)
        try {
            modal = DbConnectionManager.getTenantDb().model<T>(modelName);
        } catch (err) {
            modal = DbConnectionManager.getTenantDb().model<T>(modelName, schema);
        } finally {
            return modal;
        }
    }

    /**
     * crucial operation, perform with caution
     * @returns {boolean}
     */
    public static async deleteTenantDb(tenantId: string): Promise<void> {
        if (tenantId) return await DbConnectionManager.getTenantDb(tenantId).dropDatabase();
    }

    /**
     * @typeparam T generic should extends Document and should be passed
     * @param modelName
     * @returns {Model<T>}
     */
    public static getCoreModel<T extends Document>(modelName: string): Model<T> {
        const schema = SchemaService.get(modelName);
        let modal: Model<T>;
        // try catch to solve the modal re-register bug (by only reinitializing if not already initialized)
        try {
            modal = DbConnectionManager.getCoreDb().model<T>(modelName);
        } catch (err) {
            modal = DbConnectionManager.getCoreDb().model<T>(modelName, schema);
        } finally {
            return modal;
        }
    }
}
