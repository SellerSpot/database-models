import { BadRequestError } from '@sellerspot/universal-functions';
import {
    DeepPartial,
    ERROR_CODE,
    ICreateProductRequest,
    IEditProductRequest,
    IProductData,
} from '@sellerspot/universal-types';
import flat from 'flat';
import { Model, PopulateOptions, UpdateQuery } from 'mongoose';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { IBrandDoc, IProductDoc, IStockUnitDoc } from '../../../models/tenantDb/catalogueModels';
import { IInventoryDoc } from '../../../models/tenantDb/pointOfSaleModels';
import { InventoryService } from '../pos';
import { BrandService } from './Brand';
import { CategoryService } from './Category';
import { StockUnitService } from './StockUnit';

export class ProductService {
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
        'barcode',
        'stockUnit',
        'brand',
        'category',
    ];
    // to use in mongoose select()
    static fieldsToFetchString = ProductService.fieldsToFetch.join(' ');

    // to convert to IProductData
    static convertToIProductDataFormat = (productDoc: IProductDoc): IProductData => {
        const { _id, name, description, stockUnit, brand, category, barcode } = productDoc;
        return {
            id: _id,
            name,
            barcode,
            brand: BrandService.convertToIBrandDataFormat(brand as IBrandDoc),
            description,
            category: null,
            stockUnit: StockUnitService.convertToIStockUnitDataFormat(stockUnit as IStockUnitDoc),
        };
    };

    // create a new product
    static createProduct = async (productsProps: ICreateProductRequest): Promise<IProductData> => {
        const { brand, category, stockUnit, name, barcode, description } = productsProps;
        const Product = ProductService.getModal();

        if (brand) {
            const Brand = BrandService.getModal();

            const isBrand = await Brand.exists({ _id: brand });
            if (!isBrand)
                throw new BadRequestError(ERROR_CODE.BRAND_NOT_FOUND, 'Invalid Brand is assigned');
        }
        if (category) {
            const Category = CategoryService.getModal();

            const isCategory = await Category.exists({ _id: category });
            if (!isCategory)
                throw new BadRequestError(
                    ERROR_CODE.CATEGORY_NOT_FOUND,
                    'Invalid Category is assigned',
                );
        }
        if (stockUnit) {
            const StockUnit = StockUnitService.getModal();

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
            .populate(ProductService.getProductDefaultPopulationList())
            .execPopulate();
        return ProductService.convertToIProductDataFormat(createdProduct);
    };

    // edit specific product
    static editProduct = async (
        productId: string,
        productProps: IEditProductRequest,
    ): Promise<IProductData> => {
        const Product = ProductService.getModal();

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
        }).populate(ProductService.getProductDefaultPopulationList());

        // queuing functions
        // updating product name stored in pos inventory
        const Inventory = InventoryService.getModal();
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

        return ProductService.convertToIProductDataFormat(updatedDocument);
    };

    // get specific product
    static getProduct = async (productId: string): Promise<IProductData> => {
        const Product = ProductService.getModal();
        const product = await Product.findById(productId).populate(
            ProductService.getProductDefaultPopulationList(),
        );
        return ProductService.convertToIProductDataFormat(product);
    };

    // get all products
    static getAllProduct = async (): Promise<IProductData[]> => {
        const Product = ProductService.getModal();
        const allProducts = await Product.find({}).populate(
            ProductService.getProductDefaultPopulationList(),
        );
        return allProducts.map((product) => ProductService.convertToIProductDataFormat(product));
    };

    // search for product based on query
    static searchProduct = async (query: string): Promise<IProductData[]> => {
        const Product = ProductService.getModal();
        const matchedProducts = await Product.find({ name: new RegExp(`^${query}`, 'i') }).populate(
            ProductService.getProductDefaultPopulationList(),
        );
        return matchedProducts.map((product) =>
            ProductService.convertToIProductDataFormat(product),
        );
    };

    // delete specific product
    static deleteProduct = async (productId: string): Promise<void> => {
        const Product = ProductService.getModal();
        await Product.deleteOne({ _id: productId });
    };
}
