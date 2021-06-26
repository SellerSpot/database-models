import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { isEmpty } from 'lodash';
import { MONGOOSE_MODELS } from '../../../models';
import { ICategoryDoc } from '../../../models/tenantDb/catalogueModels';
import { BadRequestError, logger } from '@sellerspot/universal-functions';
import {
    ERROR_CODE,
    ICreateCategoryRequest,
    IEditCategoryRequest,
    IEditCategorySiblingOrderRequest,
} from '@sellerspot/universal-types';
import { Model, Types } from 'mongoose';

export const createCategory = async (
    categoryProps: ICreateCategoryRequest,
): Promise<ICategoryDoc> => {
    const Category = DbConnectionManager.getTenantModel<ICategoryDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );
    const { title } = categoryProps;
    let rootCategory;
    let { parentId } = categoryProps;
    if (isEmpty(parentId)) {
        rootCategory = await checkAndGetRootCategory(Category);
        parentId = rootCategory.id;
    }
    const category = await Category.create({ title, parent: parentId });
    logger.info(`Category got created successfully`);
    return category;
};

export const editCategoryContent = async (
    categoryId: string,
    props: IEditCategoryRequest,
): Promise<ICategoryDoc> => {
    const { title } = props;
    const Category = DbConnectionManager.getTenantModel<ICategoryDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );
    const updatedCategory = await Category.findOneAndUpdate(
        { _id: categoryId },
        { $set: { title } },
        { new: true }, //to get updated doc
    );
    return updatedCategory;
};

export const editCategorySiblingOrder = async (
    parentId: string,
    props: IEditCategorySiblingOrderRequest,
): Promise<ICategoryDoc> => {
    const { siblingOrder } = props;
    const Category = DbConnectionManager.getTenantModel<ICategoryDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );
    const tobeUpdated = await Category.findById(parentId);
    if (isEmpty(tobeUpdated)) {
        throw new BadRequestError(ERROR_CODE.CATEGORY_NOT_FOUND, `cannot find parent category`);
    }
    const isNonChild = (<Types.ObjectId[]>tobeUpdated.children).find((childId) => {
        return siblingOrder.indexOf(childId.toHexString()) === -1;
    });
    if (isNonChild || tobeUpdated.children.length !== siblingOrder.length) {
        logger.error(`contains non child value`);
        throw new BadRequestError(ERROR_CODE.NOT_FOUND, `contains invalid child category values`);
    }
    tobeUpdated.children = siblingOrder.map((idStr) => new Types.ObjectId(idStr));
    await tobeUpdated.populate({ path: 'children', select: 'id title' }).execPopulate();
    await tobeUpdated.save();
    return tobeUpdated;
};

export interface ICategoryPosition {
    newParentId: string;
    oldParentId: string;
}

export const editCategoryPosition = async (
    categoryId: string,
    props: ICategoryPosition,
): Promise<ICategoryDoc> => {
    const { newParentId, oldParentId } = props;
    const Category = DbConnectionManager.getTenantModel<ICategoryDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );

    //removes categoryId from old parent children
    await Category.updateOne(
        {
            _id: oldParentId,
        },
        {
            $pull: { children: categoryId },
        },
    );

    const isNewParentExist = await Category.exists({ _id: newParentId });

    if (!isNewParentExist) {
        logger.error(`contains invalid parent category id...`);
        throw new BadRequestError(
            ERROR_CODE.CATEGORY_NOT_FOUND,
            `contains invalid parent category id...`,
        );
    }
    //Gets the category changes the parent and updates
    //Done this way insead on direct update -> to trigger save middleware
    const category = await Category.findById(categoryId);
    category.parent = new Types.ObjectId(newParentId);
    await category.save();
    return category;
};

export const checkAndGetRootCategory = async (
    Category: Model<ICategoryDoc>,
): Promise<ICategoryDoc> => {
    let rootCategory = await Category.findOne({ title: 'root' });
    if (isEmpty(rootCategory)) {
        rootCategory = await Category.create({ title: 'root', parent: null });
    }
    return rootCategory;
};

export const getCategoryById = async (categoryId: string): Promise<ICategoryDoc> => {
    const Category = DbConnectionManager.getTenantModel<ICategoryDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );
    return await Category.findById(categoryId).populate('children').exec();
};

export const getAllCategory = async (): Promise<ICategoryDoc[]> => {
    const Category = DbConnectionManager.getTenantModel<ICategoryDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );
    const rootCategory = await checkAndGetRootCategory(Category);
    let allCategory: ICategoryDoc[] = [];
    if (rootCategory) {
        const rootId = rootCategory.id;
        allCategory = await Category.find({ ancestors: { $in: [Types.ObjectId(rootId)] } });
        allCategory.unshift(rootCategory);
    }
    return allCategory;
};

export const deleteCategory = async (categoryId: string): Promise<ICategoryDoc> => {
    const Category = DbConnectionManager.getTenantModel<ICategoryDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );
    //remove should be called on returned document and not on Model itself
    return (await Category.findById(categoryId))?.remove();
};
