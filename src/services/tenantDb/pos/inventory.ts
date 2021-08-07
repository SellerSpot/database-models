import { BadRequestError } from '@sellerspot/universal-functions';
import { ERROR_CODE, IAddProductToInventoryRequest } from '@sellerspot/universal-types';
import { Model, PopulateOptions } from 'mongoose';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { IOutletDoc } from '../../../models/tenantDb/catalogueModels';
import { IInventoryDoc } from '../../../models/tenantDb/pointOfSaleModels/Inventory';
import { ProductDbService, TaxSettingDbService } from '../catalogue';
import { OutletDbService } from '../catalogue/outlet';

export class InventoryDbService {
    static getModal = (): Model<IInventoryDoc> => {
        return DbConnectionManager.getTenantModel<IInventoryDoc>(
            MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.INVENTORY,
        );
    };

    static getAllInventoryProducts = async (): Promise<IInventoryDoc[]> => {
        const Inventory = InventoryDbService.getModal();
        const allProducts = await Inventory.find({}).populate(
            InventoryDbService.getInventoryDefaultPopulationList(),
        );
        return allProducts;
    };

    static addProductToInventory = async (
        inventoryProps: IAddProductToInventoryRequest,
    ): Promise<IInventoryDoc> => {
        const {
            productId,
            tags,
            stock,
            isTrack,
            markup,
            landingCost,
            sellingPrice,
            taxBracketId,
        } = inventoryProps;

        // checking product data
        const Product = ProductDbService.getModal();
        const isProductExist = await Product.exists({ _id: productId });
        if (!isProductExist) {
            throw new BadRequestError(ERROR_CODE.PRODUCT_NOT_FOUND, 'Product not found');
        }

        // checking tax bracket data
        if (taxBracketId) {
            const TaxBracket = TaxSettingDbService.getModal();
            const isTaxBracketExist = await TaxBracket.exists({ _id: taxBracketId });
            if (!isTaxBracketExist) {
                throw new BadRequestError(
                    ERROR_CODE.TAX_BRACKET_INVALID,
                    'Invalid Tax Bracket Found',
                );
            }
        }

        const Inventory = InventoryDbService.getModal();

        // getting default main outlet
        const mainOutlet = await getMainOutlet();

        // creating product in inventory
        const inventoryProduct = await Inventory.create({
            product: productId,
            tags,
            stock,
            isTrack,
            markup,
            landingCost,
            sellingPrice,
            taxBracket: taxBracketId,
            outlet: mainOutlet,
        });

        return inventoryProduct;
    };

    private static getInventoryDefaultPopulationList = (): PopulateOptions[] => {
        const populateArrOpts: PopulateOptions[] = [];
        populateArrOpts.push({
            path: 'product',
            populate: ProductDbService.getProductDefaultPopulationList(),
        });
        populateArrOpts.push({
            path: 'taxBracket',
            populate: TaxSettingDbService.getDefaultPopulateOptions(),
        });
        populateArrOpts.push({ path: 'outlet', select: 'id name address' });
        return populateArrOpts;
    };
}

const getMainOutlet = async (): Promise<IOutletDoc> => {
    const mainOutletName = 'Main Outlet';
    const Outlet = OutletDbService.getModal();

    let mainOutlet = await Outlet.findOne({ name: mainOutletName });
    if (!mainOutlet) {
        mainOutlet = await Outlet.create({ name: mainOutletName });
    }
    return mainOutlet;
};
