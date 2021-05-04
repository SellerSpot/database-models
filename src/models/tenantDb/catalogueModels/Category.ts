import { Document, Model, model, Schema } from 'mongoose';
import { isEmpty } from 'lodash';
import { MONGOOSE_MODELS } from '../../mongooseModels';
import { BadRequestError, logger, ServerError } from '@sellerspot/universal-functions';
import { ERROR_CODE } from '@sellerspot/universal-types';

const CategorySchema = new Schema(
    {
        title: {
            type: Schema.Types.String,
            min: 5,
            max: 255,
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
export interface ICategory {
    title: string;
    parent?: string | ICategory | null;
    ancestors?: string[] | ICategory[];
    children?: string[] | ICategory[];
}

export interface ICategoryDoc extends ICategory, Document {
    buildAncestorsAndAddAsChild(): Promise<void>;
}

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
        throw new ServerError(ERROR_CODE.OPERATION_FAILURE);
    }
};

CategorySchema.pre<ICategoryDoc>('save', async function () {
    logger.info(`entered pre save hook`);
    await this.buildAncestorsAndAddAsChild();
});

export const CategoryModel = model<ICategoryDoc>(
    MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
    CategorySchema,
);
