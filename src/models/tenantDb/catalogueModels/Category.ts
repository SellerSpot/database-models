import { Document, Model, Schema } from 'mongoose';
import { isEmpty } from 'lodash';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { BadRequestError, CustomError, logger, ServerError } from '@sellerspot/universal-functions';
import { ERROR_CODE } from '@sellerspot/universal-types';
import { CONFIG } from '../../../configs/config';
import { SchemaService } from '../../SchemaService';

export interface ICategory {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    id?: any;
    title: string;
    parent?: string | ICategory | null;
    ancestors?: string[] | ICategory[];
    children?: string[] | ICategory[];
}

export interface ICategoryDoc extends ICategory, Document {
    buildAncestorsAndAddAsChild(): Promise<void>;
    checkTitleAvailability(): Promise<void>;
    createdAt?: string;
    updatedAt?: string;
}

export const CategorySchema = new Schema(
    {
        title: {
            type: Schema.Types.String,
            min: CONFIG.DEFAULT_MIN_TEXT_SIZE,
            max: CONFIG.DEFAULT_MAX_TEXT_SIZE,
            required: true,
        },
        parent: { type: Schema.Types.ObjectId, ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY },
        ancestors: [
            {
                type: Schema.Types.ObjectId,
                default: [],
                ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
            },
        ],
        children: [
            {
                type: Schema.Types.ObjectId,
                default: [],
                ref: MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
            },
        ],
    },
    {
        timestamps: true,
        toJSON: {
            //Arg 1 -> actual doc Arg2 -> doc to be returned
            transform(_, ret) {
                (ret.id = ret._id), delete ret._id;
            },
            versionKey: false,
        },
    },
);

CategorySchema.methods.buildAncestorsAndAddAsChild = async function (this: ICategoryDoc) {
    try {
        if (this.isModified('parent') && !isEmpty(this.parent)) {
            logger.info(`buildAncestorsAndAddAsChild is triggered`);
            const parentId = this.parent;
            //creates another instance of same documents model
            const Category = <Model<ICategoryDoc>>this.constructor;
            const parent = await Category.findById(parentId);
            if (isEmpty(parent)) {
                throw new BadRequestError(
                    ERROR_CODE.CATEGORY_NOT_FOUND,
                    `cannot find parent category`,
                );
            }

            //Append child id to children array in parent doc
            const parentChildren = parent.children;
            parentChildren.push(this.id);
            await Category.findByIdAndUpdate(parent.id, { children: parentChildren });

            //Unshift parent id to ancestors array in child doc
            const parentAncestors = <string[]>parent.ancestors;
            parentAncestors.unshift(<string>parentId);
            this.set('ancestors', parentAncestors);
        }
    } catch (error) {
        logger.error(`Error occurred in buildAncestorsAndAddAsChild ${error}`);
        if (!(error instanceof CustomError)) throw new ServerError(ERROR_CODE.OPERATION_FAILURE);
        throw error;
    }
};

CategorySchema.methods.checkTitleAvailability = async function (this: ICategoryDoc) {
    try {
        if (this.isModified('title') && !isEmpty(this.parent)) {
            logger.info(`checkTitleAvailability is triggered`);
            const parentId = this.parent;
            //creates another instance of same documents model
            const Category = <Model<ICategoryDoc>>this.constructor;
            const parent = await Category.findById(parentId).populate('children', 'title');
            if (isEmpty(parent)) {
                throw new BadRequestError(
                    ERROR_CODE.CATEGORY_NOT_FOUND,
                    `cannot find parent category`,
                );
            }
            if (!isEmpty(parent.children)) {
                const filterSameTitleArr = (<ICategoryDoc[]>parent.children).filter(
                    (child: ICategoryDoc) => this.title.toUpperCase() === child.title.toUpperCase(),
                );
                if (!isEmpty(filterSameTitleArr)) {
                    throw new BadRequestError(
                        ERROR_CODE.CATEGORY_TITLE_INVALID,
                        'Same level sibling should not have same title',
                    );
                }
            }
        }
    } catch (error) {
        logger.error(`Error occurred in checkTitleAvailability ${error}`);
        if (!(error instanceof CustomError)) throw new ServerError(ERROR_CODE.OPERATION_FAILURE);
        throw error;
    }
};

CategorySchema.pre<ICategoryDoc>('save', async function () {
    logger.info(`entered pre save hook`);
    await this.checkTitleAvailability();
    await this.buildAncestorsAndAddAsChild();
});

CategorySchema.post<ICategoryDoc>('remove', async function () {
    logger.info(`Post remove middleware is triggered`);
    const deletedCategoryId = this._id;

    //creates another instance of same documents model
    const Category = <Model<ICategoryDoc>>this.constructor;

    //remove reference from immediate parent
    if (this.parent) {
        const updateRes = await Category.updateOne(
            { _id: { $in: [this.parent] } },
            { $pull: { children: deletedCategoryId } },
        );
        logger.info(
            `No of matched category ${updateRes.n} | No of matched updated ${updateRes.nModified}`,
        );
    }

    //removes all children document
    if (!isEmpty(this.children)) {
        const deleteRes = await Category.deleteMany({ ancestors: { $in: [deletedCategoryId] } });
        if (deleteRes) {
            logger.info(
                `No of matched category ${deleteRes.n} | deleted ${deleteRes.deletedCount} | childrenLength ${this.children.length}`,
            );
        }
    }
});

SchemaService.set(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY, CategorySchema);
