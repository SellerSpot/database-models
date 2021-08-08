import { BadRequestError, logger } from '@sellerspot/universal-functions';
import {
    ERROR_CODE,
    IAddProductToInventoryRequest,
    IInventoryData,
} from '@sellerspot/universal-types';
import { pick } from 'lodash';
import { Model, PopulateOptions } from 'mongoose';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { IInventoryDoc } from '../../../models/tenantDb/pointOfSaleModels/Inventory';
import { ProductDbService, TaxSettingDbService } from '../catalogue';
import { OutletDbService } from '../catalogue/outlet';

export class InventoryDbService {
    static getModal = (): Model<IInventoryDoc> => {
        return DbConnectionManager.getTenantModel<IInventoryDoc>(
            MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.INVENTORY,
        );
    };

    // holds the fields to fetch when getting or populating the modal
    static fieldsToFetch: Array<keyof IInventoryData> = [
        'id',
        'isActive',
        'isTrack',
        'landingCost',
        'markup',
        'markup',
        'mrp',
        'outlet',
        'product',
        'sellingPrice',
        'stock',
        'tags',
        'taxSetting',
    ];
    // to use in mongoose select()
    static fieldsToFetchString = InventoryDbService.fieldsToFetch.join(' ');

    static getInventoryDefaultPopulationList = (): PopulateOptions[] => {
        const populateArrOpts: PopulateOptions[] = [];
        populateArrOpts.push({
            path: 'product.reference',
            select: ProductDbService.fieldsToFetchString,
            populate: ProductDbService.getProductDefaultPopulationList(),
        });
        populateArrOpts.push({
            path: 'taxSetting',
            select: TaxSettingDbService.fieldsToFetchString,
            populate: TaxSettingDbService.getDefaultPopulateOptions(),
        });
        populateArrOpts.push({ path: 'outlet', select: OutletDbService.fieldsToFetchString });
        return populateArrOpts;
    };

    // get all products from inventory
    static getAllInventoryProducts = async (): Promise<IInventoryData[]> => {
        const Inventory = InventoryDbService.getModal();
        const allProducts = await Inventory.find({})
            .select(InventoryDbService.fieldsToFetchString)
            .populate(InventoryDbService.getInventoryDefaultPopulationList());
        return allProducts as IInventoryData[];
    };

    // search for products in inventory
    static searchInventoryProducts = async (query: string): Promise<IInventoryData[]> => {
        const Inventory = InventoryDbService.getModal();
        const matchingProducts = await Inventory.find({
            'product.name': new RegExp(`^${query}`, 'i'),
        })
            .select(InventoryDbService.fieldsToFetchString)
            .populate(InventoryDbService.getInventoryDefaultPopulationList());
        return matchingProducts as IInventoryData[];
    };

    // get a specific inventory product
    static getInventoryProduct = async (productId: string): Promise<IInventoryData> => {
        const Inventory = InventoryDbService.getModal();
        const inventoryProduct = await Inventory.findById(productId)
            .select(InventoryDbService.fieldsToFetchString)
            .populate(InventoryDbService.getInventoryDefaultPopulationList());
        return inventoryProduct as IInventoryData;
    };

    // add a new product to inventory
    static addProductToInventory = async (
        inventoryProps: IAddProductToInventoryRequest,
    ): Promise<IInventoryData[]> => {
        const { productId, tags, configurations } = inventoryProps;

        // getting modals
        const Product = ProductDbService.getModal();
        const Outlet = OutletDbService.getModal();
        const TaxSetting = TaxSettingDbService.getModal();
        const Inventory = InventoryDbService.getModal();

        // checking product data
        const productData = await Product.findById(productId);
        if (!productData) {
            throw new BadRequestError(ERROR_CODE.PRODUCT_NOT_FOUND, 'Product not found');
        }
        // getting product name for denormalisation (cause this is a search tag)
        const productName = productData.name;
        const createdCollectionOfProducts: IInventoryData[] = [];

        // iterating throught each outlet configuration
        await Promise.all(
            configurations.map(async (outletConfiguration) => {
                const {
                    mrp,
                    outletId,
                    sellingPrice,
                    isTrack,
                    landingCost,
                    markup,
                    stock,
                    taxSettingId,
                } = outletConfiguration;

                // checking outlet data
                const isOutletExist = await Outlet.exists({ _id: outletId });
                if (!isOutletExist) {
                    throw new BadRequestError(
                        ERROR_CODE.OUTLET_INVALID_OUTLET,
                        'Invalid Outlet Found',
                    );
                }

                // checking tax settings data
                if (taxSettingId) {
                    const isTaxSettingExist = await TaxSetting.exists({ _id: taxSettingId });
                    if (!isTaxSettingExist) {
                        throw new BadRequestError(
                            ERROR_CODE.TAX_BRACKET_INVALID,
                            'Invalid Tax Bracket Found',
                        );
                    }
                }

                // creating product in inventory for current outlet
                const newInventoryProductDoc = await Inventory.create({
                    product: {
                        name: productName,
                        reference: productId,
                    },
                    tags,
                    stock,
                    isTrack,
                    markup,
                    mrp,
                    landingCost,
                    sellingPrice,
                    taxSetting: taxSettingId,
                    outlet: outletId,
                });

                const newInventoryProduct = await newInventoryProductDoc
                    .populate(InventoryDbService.getInventoryDefaultPopulationList())
                    .execPopulate();

                // pushing into array to send back to client
                createdCollectionOfProducts.push(
                    pick(newInventoryProduct, InventoryDbService.fieldsToFetch) as IInventoryData,
                );
            }),
        );
        return createdCollectionOfProducts;
    };
}
