import { BadRequestError } from '@sellerspot/universal-functions';
import {
    ERROR_CODE,
    ICreateProductRequest,
    IEditProductRequest,
    IProductData,
} from '@sellerspot/universal-types';
import { pick } from 'lodash';
import { Model, PopulateOptions } from 'mongoose';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { IProductDoc } from '../../../models/tenantDb/catalogueModels';
import { BrandDbService } from './brand';
import { CategoryDbService } from './category';
import { StockUnitDbService } from './stockUnit';

export class ProductDbService {
    static getModal = (): Model<IProductDoc> => {
        return DbConnectionManager.getTenantModel<IProductDoc>(
            MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT,
        );
    };

    static getProductDefaultPopulationList = (): PopulateOptions[] => {
        const populateArrOpts: PopulateOptions[] = [];
        populateArrOpts.push({ path: 'brand', select: 'id name' });
        populateArrOpts.push({ path: 'category', select: 'id title' });
        populateArrOpts.push({ path: 'stockUnit', select: 'id name unit' });
        return populateArrOpts;
    };

    // holds the fields to fetch when getting or populating the modal
    static fieldsToFetch: Array<keyof IProductData> = [
        'id',
        'name',
        'description',
        'stockUnit',
        'brand',
        'category',
    ];
    // to use in mongoose select()
    static fieldsToFetchString = ProductDbService.fieldsToFetch.join(' ');

    // create a new product
    static createProduct = async (productsProps: ICreateProductRequest): Promise<IProductData> => {
        const { brand, category, stockUnit, name, barcode, description } = productsProps;
        const Product = ProductDbService.getModal();

        if (brand) {
            const Brand = BrandDbService.getModal();

            const isBrand = await Brand.exists({ _id: brand });
            if (!isBrand)
                throw new BadRequestError(ERROR_CODE.BRAND_NOT_FOUND, 'Invalid Brand is assigned');
        }
        if (category) {
            const Category = CategoryDbService.getModal();

            const isCategory = await Category.exists({ _id: category });
            if (!isCategory)
                throw new BadRequestError(
                    ERROR_CODE.CATEGORY_NOT_FOUND,
                    'Invalid Category is assigned',
                );
        }
        if (stockUnit) {
            const StockUnit = StockUnitDbService.getModal();

            const isStockUnit = await StockUnit.exists({ _id: stockUnit });
            if (!isStockUnit)
                throw new BadRequestError(
                    ERROR_CODE.STOCK_UNIT_NOT_FOUND,
                    'Invalid stock unit is assigned',
                );
        }
        const createdProductDoc = await Product.create({
            brand,
            category,
            stockUnit,
            name,
            barcode,
            description,
        });
        const createdProduct = await createdProductDoc
            .populate(ProductDbService.getProductDefaultPopulationList())
            .execPopulate();
        return pick(createdProduct, ProductDbService.fieldsToFetch) as IProductData;
    };

    // edit specific product
    static editProduct = async (
        productId: string,
        productProps: IEditProductRequest,
    ): Promise<IProductData> => {
        const Product = ProductDbService.getModal();
        // checking if product exists
        const isProduct = await Product.exists({ _id: productId });
        if (!isProduct) {
            throw new BadRequestError(ERROR_CODE.PRODUCT_NOT_FOUND, 'Product not found');
        }
        const updatedDocument = await Product.findByIdAndUpdate(productId, productProps)
            .select(ProductDbService.fieldsToFetchString)
            .populate(ProductDbService.getProductDefaultPopulationList());

        return updatedDocument as IProductData;
    };

    // get specific product
    static getProduct = async (productId: string): Promise<IProductData> => {
        const Product = ProductDbService.getModal();
        const product = await Product.findById(productId)
            .select(ProductDbService.fieldsToFetchString)
            .populate(ProductDbService.getProductDefaultPopulationList());
        return product as IProductData;
    };

    // get all products
    static getAllProduct = async (): Promise<IProductData[]> => {
        const Product = ProductDbService.getModal();
        const productList = await Product.find({})
            .select(ProductDbService.fieldsToFetchString)
            .populate(ProductDbService.getProductDefaultPopulationList());
        return productList as IProductData[];
    };

    // search for product based on query
    static searchProduct = async (query: string): Promise<IProductData[]> => {
        const Product = ProductDbService.getModal();
        const matchedProducts = await Product.find({ name: new RegExp(`^${query}`, 'i') })
            .select(ProductDbService.fieldsToFetchString)
            .populate(ProductDbService.getProductDefaultPopulationList());
        return matchedProducts as IProductData[];
    };

    // delete specific product
    static deleteProduct = async (productId: string): Promise<void> => {
        const Product = ProductDbService.getModal();
        await Product.deleteOne({ _id: productId });
    };
}
