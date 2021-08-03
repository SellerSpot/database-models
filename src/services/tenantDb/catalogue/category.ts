import { BadRequestError, logger } from '@sellerspot/universal-functions';
import {
    ERROR_CODE,
    ICreateCategoryRequest,
    IEditCategoryChildrenOrderRequest,
    IEditCategoryRequest,
} from '@sellerspot/universal-types';
import { isEmpty } from 'lodash';
import { Model, Types } from 'mongoose';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { ICategoryDoc } from '../../../models/tenantDb/catalogueModels';

export interface ICategoryPosition {
    newParentId: string;
    oldParentId: string;
}
export class CategoryDbService {
    static getModal = (): Model<ICategoryDoc> => {
        return DbConnectionManager.getTenantModel<ICategoryDoc>(
            MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
        );
    };

    static createCategory = async (
        categoryProps: ICreateCategoryRequest,
    ): Promise<ICategoryDoc> => {
        const Category = CategoryDbService.getModal();
        const { title } = categoryProps;
        let { parentId } = categoryProps;
        if (!parentId) {
            const rootCategory = await CategoryDbService.checkAndGetRootCategory(Category);
            parentId = rootCategory.id;
        }
        const category = await Category.create({ title, parent: parentId });
        logger.info(`Category ${title} created successfully`);
        return category;
    };

    static editCategoryContent = async (
        categoryId: string,
        props: IEditCategoryRequest,
    ): Promise<ICategoryDoc> => {
        const { title } = props;
        const Category = CategoryDbService.getModal();
        const updatedCategory = await Category.findOneAndUpdate(
            { _id: categoryId },
            { $set: { title } },
            { new: true }, //to get updated doc
        );

        const populatedUpdatedCategory = await updatedCategory
            .populate({ path: 'children', select: 'id title' })
            .execPopulate();
        return populatedUpdatedCategory;
    };

    static editCategoryChildrenOrder = async (
        parentId: string,
        props: IEditCategoryChildrenOrderRequest,
    ): Promise<ICategoryDoc> => {
        const { childrenOrder } = props;
        const Category = CategoryDbService.getModal();
        const tobeUpdated = await Category.findById(parentId);
        if (isEmpty(tobeUpdated)) {
            throw new BadRequestError(ERROR_CODE.CATEGORY_NOT_FOUND, `cannot find parent category`);
        }
        const isNonChild = (<Types.ObjectId[]>tobeUpdated.children).find((childId) => {
            return childrenOrder.indexOf(childId.toHexString()) === -1;
        });
        if (isNonChild || tobeUpdated.children.length !== childrenOrder.length) {
            logger.error(`contains non child value`);
            throw new BadRequestError(
                ERROR_CODE.NOT_FOUND,
                `contains invalid child category values`,
            );
        }
        tobeUpdated.children = childrenOrder.map((idStr) => new Types.ObjectId(idStr));
        await tobeUpdated.populate({ path: 'children', select: 'id title' }).execPopulate();
        await tobeUpdated.save();
        return tobeUpdated;
    };

    static editCategoryPosition = async (
        categoryId: string,
        props: ICategoryPosition,
    ): Promise<ICategoryDoc> => {
        let { oldParentId, newParentId } = props;
        const Category = CategoryDbService.getModal();

        // getting root category id if no parent id is provided
        if (!newParentId || !oldParentId) {
            const rootCategory = await CategoryDbService.checkAndGetRootCategory(Category);
            if (!newParentId) {
                newParentId = rootCategory.id;
            }
            if (!oldParentId) {
                oldParentId = rootCategory.id;
            }
        }

        // removes categoryId from old parent children
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
            logger.error(`Parent category invalid`);
            throw new BadRequestError(ERROR_CODE.CATEGORY_NOT_FOUND, `Parent category invalid`);
        }
        //Gets the category changes the parent and updates
        //Done this way insead on direct update -> to trigger save middleware
        const category = await Category.findById(categoryId);
        category.parent = new Types.ObjectId(newParentId);
        await category.save();
        return category;
    };

    static checkAndGetRootCategory = async (
        Category: Model<ICategoryDoc>,
    ): Promise<ICategoryDoc> => {
        let rootCategory = await Category.findOne({ title: 'root' });
        if (isEmpty(rootCategory)) {
            rootCategory = await Category.create({ title: 'root', parent: null });
        }
        return rootCategory;
    };

    static getCategoryById = async (categoryId: string): Promise<ICategoryDoc> => {
        const Category = CategoryDbService.getModal();
        return await Category.findById(categoryId).populate('children').exec();
    };

    static getAllCategory = async (): Promise<ICategoryDoc[]> => {
        const Category = CategoryDbService.getModal();
        const rootCategory = await CategoryDbService.checkAndGetRootCategory(Category);
        let allCategory: ICategoryDoc[] = [];
        if (rootCategory) {
            const rootId = rootCategory.id;
            allCategory = await Category.find({ ancestors: { $in: [Types.ObjectId(rootId)] } });
            allCategory.unshift(rootCategory);
        }
        return allCategory;
    };

    static deleteCategory = async (categoryId: string): Promise<ICategoryDoc> => {
        const Category = CategoryDbService.getModal();
        //remove should be called on returned document and not on Model itself
        return (await Category.findById(categoryId))?.remove();
    };
}
