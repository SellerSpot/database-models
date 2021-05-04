import { DbConnectionManager } from '../../../configs/initializer';
import { isEmpty } from 'lodash';
import { MONGOOSE_MODELS } from '../../../models';
import { ICategory, ICategoryDoc } from '../../../models/tenantDb/catalogueModels';
import { logger } from '@sellerspot/universal-functions';
import { LeanDocumentOrArray } from 'mongoose';

export const createCategory = async (
    props: Pick<ICategory, 'title' | 'parent' | 'children'>,
): Promise<ICategoryDoc> => {
    const Category = DbConnectionManager.getTenantModel<ICategoryDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );
    const { title, children } = props;
    let rootCategory;
    let { parent } = props;
    if (isEmpty(parent)) {
        rootCategory = await getRootCategory();
        if (isEmpty(rootCategory)) {
            rootCategory = await Category.create({ title: 'root', parent: null });
        }
        parent = rootCategory.id;
    }
    const category = await Category.create({ title, parent, children });
    logger.info(`Category got created successfully`);
    return category;
};

export const editCategoryContent = async (
    categoryId: string,
    props: Pick<ICategory, 'title'>,
): Promise<ICategoryDoc> => {
    const { title } = props;
    const Category = DbConnectionManager.getTenantModel<ICategoryDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );
    const updatedCategory = await Category.findByIdAndUpdate(categoryId, {
        title,
    }).exec();
    return updatedCategory;
};

export interface ICategorySibling {
    siblingOrder: string[];
}

export const editCategorySiblingOrder = async (
    parentId: string,
    props: ICategorySibling,
): Promise<ICategoryDoc> => {
    const { siblingOrder } = props;
    const Category = DbConnectionManager.getTenantModel<ICategoryDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );
    const updatedCategory = await Category.findByIdAndUpdate(parentId, {
        children: siblingOrder,
    })
        .populate('children')
        .exec();
    return updatedCategory;
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
    await Category.updateOne({
        id: oldParentId,
        $pull: { children: { $in: [categoryId] } },
    }).exec();

    //Gets the category changes the parent and updates
    //Done this way insead on direct update -> to trigger save middleware
    const category = await Category.findById(categoryId).exec();
    category.parent = newParentId;
    await category.save();
    return category;
};

export const getRootCategory = async (): Promise<ICategoryDoc> => {
    const Category = DbConnectionManager.getTenantModel<ICategoryDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );
    return await Category.findOne({ title: 'root' });
};

export const getCategoryById = async (categoryId: string): Promise<ICategoryDoc> => {
    const Category = DbConnectionManager.getTenantModel<ICategoryDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );
    return await Category.findById(categoryId).populate('children').exec();
};

export const getAllCategory = async (): Promise<LeanDocumentOrArray<ICategoryDoc[]>> => {
    const Category = DbConnectionManager.getTenantModel<ICategoryDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    );
    const rootCategory = await getRootCategory();
    const rootId = rootCategory.id;
    const allCategory = await Category.find({ ancestors: rootId }).lean().exec();
    allCategory.unshift(rootCategory);
    return allCategory;
};
