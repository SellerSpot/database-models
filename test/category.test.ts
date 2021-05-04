import mongoose, { Connection } from 'mongoose';
import { DB_NAMES, models } from '../src';
import {
    createCategory,
    getRootCategory,
    getCategoryById,
    getAllCategory,
} from '../src/services/tenantDb/catalogue';
import { DbConnectionManager } from '../src';
import { ICategoryDoc } from '../src/models/tenantDb/catalogueModels';

describe('Category Model Test', () => {
    let connection: Connection;
    let tenantConnection: Connection;
    beforeAll(async () => {
        const MONGO_URL = `mongodb://127.0.0.1/${DB_NAMES.TEST_DB}`;
        connection = await mongoose.createConnection(MONGO_URL, {
            useUnifiedTopology: true,
            useFindAndModify: false,
            useNewUrlParser: true,
            useCreateIndex: true,
        });
        //Just used like this for testing (core === tenant)
        DbConnectionManager.intialize(connection);
        DbConnectionManager.setTenantDb(DB_NAMES.TEST_DB);
        tenantConnection = DbConnectionManager.getTenantDb();
        models.handsake;
    });

    afterAll(async () => {
        await DbConnectionManager.getTenantModel<ICategoryDoc>(
            models.MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
        ).deleteMany();
        await connection.close();
        await tenantConnection.close();
    });

    it('create & category and checks mapping', async () => {
        const {
            rootCategory,
            child1,
            child2,
            child11,
            child12,
            child21,
            child22,
        } = await populateData();

        expect(child1.parent.toString()).toEqual(rootCategory.id);

        expect(child2.parent.toString()).toEqual(rootCategory.id);

        expect(child11.parent.toString()).toEqual(child1.id);

        expect(child12.parent.toString()).toEqual(child1.id);

        expect(child21.parent.toString()).toEqual(child2.id);

        expect(child22.parent.toString()).toEqual(child2.id);

        //children checks
        expect(rootCategory.children).toContainEqual(mongoose.Types.ObjectId(child1.id));
        expect(rootCategory.children).toContainEqual(mongoose.Types.ObjectId(child2.id));

        //done this way as children is populated
        expect((<ICategoryDoc[]>child1.children).map((child) => child._id)).toContainEqual(
            mongoose.Types.ObjectId(child11.id),
        );
        expect((<ICategoryDoc[]>child1.children).map((child) => child._id)).toContainEqual(
            mongoose.Types.ObjectId(child12.id),
        );

        expect((<ICategoryDoc[]>child2.children).map((child) => child._id)).toContainEqual(
            mongoose.Types.ObjectId(child21.id),
        );
        expect((<ICategoryDoc[]>child2.children).map((child) => child._id)).toContainEqual(
            mongoose.Types.ObjectId(child21.id),
        );

        //ancestors checks
        expect(rootCategory.ancestors.length).toBe(0);

        expect(child11.ancestors).toContainEqual(mongoose.Types.ObjectId(rootCategory.id));
        expect(child11.ancestors).toContainEqual(mongoose.Types.ObjectId(child1.id));

        expect(child12.ancestors).toContainEqual(mongoose.Types.ObjectId(rootCategory.id));
        expect(child12.ancestors).toContainEqual(mongoose.Types.ObjectId(child1.id));

        expect(child21.ancestors).toContainEqual(mongoose.Types.ObjectId(rootCategory.id));
        expect(child21.ancestors).toContainEqual(mongoose.Types.ObjectId(child2.id));

        expect(child22.ancestors).toContainEqual(mongoose.Types.ObjectId(rootCategory.id));
        expect(child22.ancestors).toContainEqual(mongoose.Types.ObjectId(child2.id));
    });

    it('Getts all nodes in tree', async () => {
        const allCategory = await getAllCategory();
    });
});

const populateData = async () => {
    let child1 = await createCategory({ title: `Child 1` });
    let child2 = await createCategory({ title: `Child 2` });

    let child11 = await createCategory({
        title: `Child Level 2 Sibbling 1`,
        parent: child1.id,
    });

    let child12 = await createCategory({
        title: `Child Level 2 Sibbling 2`,
        parent: child1.id,
    });

    let child21 = await createCategory({
        title: `Child Level 2 Sibbling 3`,
        parent: child2.id,
    });

    let child22 = await createCategory({
        title: `Child Level 2 Sibbling 4`,
        parent: child2.id,
    });

    child1 = await getCategoryById(child1.id);
    child2 = await getCategoryById(child2.id);
    child11 = await getCategoryById(child11.id);
    child12 = await getCategoryById(child12.id);
    child21 = await getCategoryById(child21.id);
    child22 = await getCategoryById(child22.id);

    const rootCategory = await getRootCategory();

    return { rootCategory, child1, child2, child11, child12, child21, child22 };
};
