import { BadRequestError } from '@sellerspot/universal-functions';
import {
    ERROR_CODE,
    ICreateProductRequest,
    IEditProductRequest,
} from '@sellerspot/universal-types';
import { merge } from 'lodash';
import { PopulateOptions } from 'mongoose';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { IProductDoc, IStockUnitDoc } from '../../../models/tenantDb/catalogueModels';

export const createProduct = async (productProps: ICreateProductRequest): Promise<IProductDoc> => {
    const { brand, category, stockUnit, ...args } = productProps;
    const Product = DbConnectionManager.getTenantModel<IProductDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT,
    );
    if (brand) {
        const Brand = DbConnectionManager.getTenantModel<IProductDoc>(
            MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND,
        );
        const isBrand = await Brand.exists({ _id: brand });
        if (!isBrand)
            throw new BadRequestError(ERROR_CODE.BRAND_NOT_FOUND, 'Invalid Brand is assigned');
    }
    if (category) {
        const Category = DbConnectionManager.getTenantModel<IProductDoc>(
            MONGOOSE_MODELS.TENANT_DB.CATALOGUE.CATEGORY,
        );
        const isCategory = await Category.exists({ _id: category });
        if (!isCategory)
            throw new BadRequestError(
                ERROR_CODE.CATEGORY_NOT_FOUND,
                'Invalid Category is assigned',
            );
    }
    if (stockUnit) {
        const StockUnit = DbConnectionManager.getTenantModel<IStockUnitDoc>(
            MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT,
        );
        const isStockUnit = await StockUnit.exists({ _id: stockUnit });
        if (!isStockUnit)
            throw new BadRequestError(
                ERROR_CODE.STOCK_UNIT_NOT_FOUND,
                'Invalid stock unit is assigned',
            );
    }
    let product = await Product.create({ brand, category, stockUnit, ...args });
    const populateArrOpts: PopulateOptions[] = [];
    if (brand) populateArrOpts.push({ path: 'brand', select: 'id name' });
    if (category) populateArrOpts.push({ path: 'category', select: 'id title' });
    if (stockUnit) populateArrOpts.push({ path: 'stockUnit', select: 'id title' });
    if (populateArrOpts.length > 0) {
        /**
         * On Documnent we should use execPopulate to actually execute it
         * @link https://mongoosejs.com/docs/api.html#document_Document-populate
         **/
        product = await product.populate(populateArrOpts).execPopulate();
    }
    return product;
};

export const editProduct = async (
    productId: string,
    productProps: IEditProductRequest,
): Promise<IProductDoc> => {
    const Product = DbConnectionManager.getTenantModel<IProductDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT,
    );
    let product = await Product.findById(productId);
    if (!product) {
        throw new BadRequestError(ERROR_CODE.PRODUCT_NOT_FOUND, 'Product not found');
    }
    merge(product, productProps);
    await product.save();
    product = await product.populate(getProductDefaultPopulationList()).execPopulate();
    return product;
};

export const getProduct = async (productId: string): Promise<IProductDoc> => {
    const Product = DbConnectionManager.getTenantModel<IProductDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT,
    );
    const product = await Product.findById(productId).populate(getProductDefaultPopulationList());
    return product;
};

export const getAllProduct = async (): Promise<IProductDoc[]> => {
    const Product = DbConnectionManager.getTenantModel<IProductDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT,
    );
    const productList = await Product.find({}).populate(getProductDefaultPopulationList());
    return productList;
};

// export const searchProduct = async (query: string): Promise<IProductDoc> => {
//     const Product = DbConnectionManager.getTenantModel<IProductDoc>(
//         MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT,
//     );
//     const product = await Product(productId).populate(getProductDefaultPopulationList());
//     return product;
// };

export const deleteProduct = async (productId: string): Promise<void> => {
    const Product = DbConnectionManager.getTenantModel<IProductDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT,
    );
    await Product.deleteOne({ _id: productId });
};

const getProductDefaultPopulationList = (): PopulateOptions[] => {
    const populateArrOpts: PopulateOptions[] = [];
    populateArrOpts.push({ path: 'brand', select: 'id name' });
    populateArrOpts.push({ path: 'category', select: 'id title' });
    populateArrOpts.push({ path: 'stockUnit', select: 'id title' });
    return populateArrOpts;
};
