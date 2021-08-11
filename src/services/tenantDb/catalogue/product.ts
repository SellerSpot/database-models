import { BadRequestError } from '@sellerspot/universal-functions';
import {
    DeepPartial,
    ERROR_CODE,
    ICategoryData,
    ICreateProductRequest,
    IEditProductRequest,
    IProductData,
    IStockUnitData,
} from '@sellerspot/universal-types';
import flat from 'flat';
import { Model, PopulateOptions, UpdateQuery } from 'mongoose';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { ICategoryDoc, IProductDoc, IStockUnitDoc } from '../../../models/tenantDb/catalogueModels';
import { IInventoryDoc } from '../../../models/tenantDb/pointOfSaleModels';
import { InventoryDbService } from '../pos';
import { BrandDbService } from './brand';
import { CategoryDbService } from './category';
import { StockUnitDbService } from './stockUnit';

export class ProductDbService {
    static getModal = (): Model<IProductDoc> =>
        DbConnectionManager.getTenantModel<IProductDoc>(
            MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT,
        );

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

    // to convert to IProductData
    static convertToIProductDataFormat = (productDoc: IProductDoc): IProductData => {
        const { _id, name, description, stockUnit, brand, category, barcode } = productDoc;
        return {
            id: _id,
            name,
            barcode,
            brand,
            description,
            category: null,
            stockUnit: StockUnitDbService.convertToIStockUnitDataFormat(stockUnit as IStockUnitDoc),
        };
    };

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
        return ProductDbService.convertToIProductDataFormat(createdProduct);
    };

    // edit specific product
    static editProduct = async (
        productId: string,
        productProps: IEditProductRequest,
    ): Promise<IProductData> => {
        const Product = ProductDbService.getModal();

        // checking if product exists
        const doesProductExists = await Product.exists({ _id: productId });
        if (!doesProductExists) {
            throw new BadRequestError(ERROR_CODE.PRODUCT_NOT_FOUND, 'Product not found');
        }

        const document: UpdateQuery<IProductDoc> = {
            name: productProps.name,
            barcode: productProps.barcode,
            description: productProps.description,
            stockUnit: productProps.stockUnit as string,
            brand: productProps.brand as string,
            category: productProps.category as string,
        };
        const updatedDocument = await Product.findByIdAndUpdate(productId, document, {
            new: true,
        }).populate(ProductDbService.getProductDefaultPopulationList());

        // queuing functions
        // updating product name stored in pos inventory
        const Inventory = InventoryDbService.getModal();
        // getting flat version of collection path for nested mongoose search
        const pathToSearch = flat({
            product: {
                reference: productId,
            },
        } as DeepPartial<IInventoryDoc>);
        // path of the object to update (product.name)
        const pathToUpdate = flat({
            product: {
                name: updatedDocument.name,
            },
        } as DeepPartial<IInventoryDoc>);
        // updating all relevant inventory entries
        Inventory.updateMany(pathToSearch, {
            $set: pathToUpdate,
        });

        return ProductDbService.convertToIProductDataFormat(updatedDocument);
    };

    // get specific product
    static getProduct = async (productId: string): Promise<IProductData> => {
        const Product = ProductDbService.getModal();
        const product = await Product.findById(productId).populate(
            ProductDbService.getProductDefaultPopulationList(),
        );
        return ProductDbService.convertToIProductDataFormat(product);
    };

    // get all products
    static getAllProduct = async (): Promise<IProductData[]> => {
        const Product = ProductDbService.getModal();
        const allProducts = await Product.find({}).populate(
            ProductDbService.getProductDefaultPopulationList(),
        );
        return allProducts.map((product) => ProductDbService.convertToIProductDataFormat(product));
    };

    // search for product based on query
    static searchProduct = async (query: string): Promise<IProductData[]> => {
        const Product = ProductDbService.getModal();
        const matchedProducts = await Product.find({ name: new RegExp(`^${query}`, 'i') }).populate(
            ProductDbService.getProductDefaultPopulationList(),
        );
        return matchedProducts.map((product) =>
            ProductDbService.convertToIProductDataFormat(product),
        );
    };

    // delete specific product
    static deleteProduct = async (productId: string): Promise<void> => {
        const Product = ProductDbService.getModal();
        await Product.deleteOne({ _id: productId });
    };
}
