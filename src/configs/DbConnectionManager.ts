import { Connection, Document, Model } from 'mongoose';
import { AuthUtil } from '@sellerspot/universal-functions';
import { MODEL_NAME_VS_SCHEMA } from '../models/schemaMap';

export class DbConnectionManager {
    private static _core: Connection;

    public static intialize(conn: Connection): void {
        DbConnectionManager._core = conn;
    }
    public static getCoreDb(): Connection {
        return DbConnectionManager._core;
    }

    public static getTenantDb(): Connection {
        return DbConnectionManager._core?.useDb(AuthUtil.getCurrentTenantId(), {
            useCache: true,
        });
    }

    /**
     * @typeparam T generic should extends Document and should be passed
     * @param modelName
     * @returns {Model<T>}
     */
    public static getTenantModel<T extends Document>(modelName: string): Model<T> {
        const schema = MODEL_NAME_VS_SCHEMA[modelName];
        return DbConnectionManager.getTenantDb().model<T>(modelName, schema);
    }

    /**
     * @typeparam T generic should extends Document and should be passed
     * @param modelName
     * @returns {Model<T>}
     */
    public static getCoreModel<T extends Document>(modelName: string): Model<T> {
        const schema = MODEL_NAME_VS_SCHEMA[modelName];
        return DbConnectionManager.getCoreDb().model<T>(modelName, schema);
    }
}
