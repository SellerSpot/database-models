import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { isEmpty } from 'lodash';
import { MONGOOSE_MODELS } from '../../../models';
import { ICategory } from '../../../models/tenantDb/catalogueModels';
import { BadRequestError, logger } from '@sellerspot/universal-functions';
import { ERROR_CODE } from '@sellerspot/universal-types';

export const createCategory = async (
    props: Pick<ICategory, 'title' | 'parent'>,
): Promise<ICategory> => {
    const Category = DbConnectionManager.getTenantModel<ICategory>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );
    const { title } = props;
    let rootCategory;
    let { parent } = props;
    if (isEmpty(parent)) {
        rootCategory = await getRootCategory();
        if (isEmpty(rootCategory)) {
            rootCategory = await Category.create({ title: 'root', parent: null });
        }
        parent = rootCategory.id;
    }
    const category = await Category.create({ title, parent });
    logger.info(`Category got created successfully`);
    return category;
};

export const editCategoryContent = async (
    categoryId: string,
    props: Pick<ICategory, 'title'>,
): Promise<ICategory> => {
    const { title } = props;
    const Category = DbConnectionManager.getTenantModel<ICategory>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );
    const updatedCategory = await Category.findOneAndUpdate(
        { _id: categoryId },
        { $set: { title } },
        { new: true }, //to get updated doc
    );
    return updatedCategory;
};

export interface ICategorySibling {
    siblingOrder: string[];
}

export const editCategorySiblingOrder = async (
    parentId: string,
    props: ICategorySibling,
): Promise<ICategory> => {
    const { siblingOrder } = props;
    const Category = DbConnectionManager.getTenantModel<ICategory>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );
    const updatedCategory = await Category.findByIdAndUpdate(parentId);

    if (isEmpty(updatedCategory)) {
        throw new BadRequestError(ERROR_CODE.CATEGORY_NOT_FOUND, `cannot find parent category`);
    }

    const nonChild = (<string[]>updatedCategory.children).find((childId) => {
        return siblingOrder.indexOf(childId.toString()) === -1;
    });

    if (nonChild || updatedCategory.children.length !== siblingOrder.length) {
        logger.error(`contains non child value`);
        throw new BadRequestError(ERROR_CODE.NOT_FOUND, `contains invalid child category values`);
    }
    updatedCategory.children = siblingOrder;
    await updatedCategory.populate({ path: 'children', select: 'id title' }).execPopulate();
    await updatedCategory.save();
    return updatedCategory;
};

export interface ICategoryPosition {
    newParentId: string;
    oldParentId: string;
}

export const editCategoryPosition = async (
    categoryId: string,
    props: ICategoryPosition,
): Promise<ICategory> => {
    const { newParentId, oldParentId } = props;
    const Category = DbConnectionManager.getTenantModel<ICategory>(
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

    //Gets the category changes the parent and updates
    //Done this way insead on direct update -> to trigger save middleware
    const category = await Category.findById(categoryId);
    category.parent = newParentId;
    await category.save();
    return category;
};

export const getRootCategory = async (): Promise<ICategory> => {
    const Category = DbConnectionManager.getTenantModel<ICategory>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );
    return await Category.findOne({ title: 'root' });
};

export const getCategoryById = async (categoryId: string): Promise<ICategory> => {
    const Category = DbConnectionManager.getTenantModel<ICategory>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );
    return await Category.findById(categoryId).populate('children').exec();
};

export const getAllCategory = async (): Promise<ICategory[]> => {
    const Category = DbConnectionManager.getTenantModel<ICategory>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );
    const rootCategory = await getRootCategory();
    let allCategory: ICategory[] = [];
    if (rootCategory) {
        const rootId = rootCategory.id;
        allCategory = await Category.find({ ancestors: rootId });
        allCategory.unshift(rootCategory);
    }
    return allCategory;
};

export const deleteCategory = async (categoryId: string): Promise<ICategory> => {
    const Category = DbConnectionManager.getTenantModel<ICategory>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );
    //remove should be called on returned document and not on Model itself
    return (await Category.findById(categoryId))?.remove();
};
