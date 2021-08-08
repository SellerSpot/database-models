import { BadRequestError } from '@sellerspot/universal-functions';
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
            path: 'product',
            select: ProductDbService.fieldsToFetchString,
            populate: ProductDbService.getProductDefaultPopulationList(),
        });
        populateArrOpts.push({
            path: 'taxSetting',
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
        const matchingProducts = await Inventory.find({})
            .select(InventoryDbService.fieldsToFetchString)
            .populate(InventoryDbService.getInventoryDefaultPopulationList());
        return matchingProducts as IInventoryData[];
    };

    // add a new product to inventory
    static addProductToInventory = async (
        inventoryProps: IAddProductToInventoryRequest,
    ): Promise<IInventoryData> => {
        const {
            productId,
            tags,
            stock,
            isTrack,
            markup,
            landingCost,
            sellingPrice,
            outletId,
            mrp,
            taxSettingId,
        } = inventoryProps;

        // checking product data
        const Product = ProductDbService.getModal();
        const isProductExist = await Product.exists({ _id: productId });
        if (!isProductExist) {
            throw new BadRequestError(ERROR_CODE.PRODUCT_NOT_FOUND, 'Product not found');
        }

        // checking tax settings data
        if (taxSettingId) {
            const TaxSetting = TaxSettingDbService.getModal();
            const isTaxSettingExist = await TaxSetting.exists({ _id: taxSettingId });
            if (!isTaxSettingExist) {
                throw new BadRequestError(
                    ERROR_CODE.TAX_BRACKET_INVALID,
                    'Invalid Tax Bracket Found',
                );
            }
        }

        // checking outlet data
        const Outlet = OutletDbService.getModal();
        const isOutletExist = await Outlet.exists({ _id: outletId });
        if (!isOutletExist) {
            throw new BadRequestError(ERROR_CODE.OUTLET_INVALID_OUTLET, 'Invalid Outlet Found');
        }

        const Inventory = InventoryDbService.getModal();

        // creating product in inventory
        const newInventoryProductDoc = await Inventory.create({
            product: productId,
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

        return pick(newInventoryProduct, InventoryDbService.fieldsToFetch) as IInventoryData;
    };
}
