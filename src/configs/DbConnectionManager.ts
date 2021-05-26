import { Connection, Document, Model } from 'mongoose';
import { CLSService } from '@sellerspot/universal-functions';
import { SchemaService } from '../models/SchemaService';

export class DbConnectionManager {
    private static _core: Connection;

    public static intialize(conn: Connection): void {
        DbConnectionManager._core = conn;
    }
    public static getCoreDb(): Connection {
        return DbConnectionManager._core;
    }

    public static getTenantDb(): Connection {
        return DbConnectionManager._core?.useDb(CLSService.getData('tenantId'), {
            useCache: true,
        });
    }

    /**
     * @typeparam T generic should extends Document and should be passed
     * @param modelName
     * @returns {Model<T>}
     */
    public static getTenantModel<T extends Document>(modelName: string): Model<T> {
        const schema = SchemaService.get(modelName);
        return DbConnectionManager.getTenantDb().model<T>(modelName, schema);
    }

    /**
     * @typeparam T generic should extends Document and should be passed
     * @param modelName
     * @returns {Model<T>}
     */
    public static getCoreModel<T extends Document>(modelName: string): Model<T> {
        const schema = SchemaService.get(modelName);
        return DbConnectionManager.getCoreDb().model<T>(modelName, schema);
    }
}
