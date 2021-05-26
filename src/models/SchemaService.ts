import { model, Schema } from 'mongoose';

const schemaMap = new Map<string, Schema>();

export const SchemaService = {
    set: (schemaName: string, schema: Schema): void => {
        // tapping set api to register model into runtime seamlessly
        // registering schema into runtime
        model(schemaName, schema);
        // setting schema for further access
        schemaMap.set(schemaName, schema);
    },
    get: (schemaName: string): ReturnType<typeof schemaMap.get> => schemaMap.get(schemaName),
};
