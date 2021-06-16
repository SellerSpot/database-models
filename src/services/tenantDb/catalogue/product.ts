import { BadRequestError } from '@sellerspot/universal-functions';
import { ERROR_CODE, IProductRequest } from '@sellerspot/universal-types';
import { PopulateOptions } from 'mongoose';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { IProduct } from '../../../models/tenantDb/catalogueModels';

export const createProduct = async (productProps: IProductRequest): Promise<IProduct> => {
    const { brand, category, ...args } = productProps;
    const Product = DbConnectionManager.getTenantModel<IProduct>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT,
    );
    if (brand) {
        const Brand = DbConnectionManager.getTenantModel<IProduct>(
            MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND,
        );
        const isBrand = await Brand.exists({ _id: brand });
        if (!isBrand)
            throw new BadRequestError(ERROR_CODE.BRAND_NOT_FOUND, 'Invalid Brand is assigned');
    }
    if (category) {
        const Category = DbConnectionManager.getTenantModel<IProduct>(
            MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
        );
        const isCategory = await Category.exists({ _id: category });
        if (!isCategory)
            throw new BadRequestError(
                ERROR_CODE.CATEGORY_NOT_FOUND,
                'Invalid Category is assigned',
            );
    }
    let product = await Product.create({ brand, category, ...args });
    const populateArrOpts: PopulateOptions[] = [];
    if (brand) populateArrOpts.push({ path: 'brand', select: 'id name' });
    if (category) populateArrOpts.push({ path: 'category', select: 'id title' });
    if (populateArrOpts.length > 0) {
        /**
         * On Documnent we should use execPopulate to actually execute it
         * @link https://mongoosejs.com/docs/api.html#document_Document-populate
         **/
        product = await product.populate(populateArrOpts).execPopulate();
    }
    return product;
};

export const getProduct = async (productId: string): Promise<IProduct> => {
    const Product = DbConnectionManager.getTenantModel<IProduct>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT,
    );
    const product = await Product.findById(productId);
    return product;
};
