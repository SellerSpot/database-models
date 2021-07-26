import { ERROR_CODE, ICreateInventoryRequest } from '@sellerspot/universal-types';
import { BadRequestError } from '../../../../.yalc/@sellerspot/universal-functions/dist';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { IOutletDoc, IProductDoc, ITaxSettingDoc } from '../../../models/tenantDb/catalogueModels';
import { IInventoryDoc } from '../../../models/tenantDb/pointOfSaleModels/Inventory';

export const addProductToInventory = async (
    inventoryProps: ICreateInventoryRequest,
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

    const Product = DbConnectionManager.getTenantModel<IProductDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.PRODUCT,
    );
    const isProductExist = await Product.exists({ _id: productId });

    if (!isProductExist) {
        throw new BadRequestError(ERROR_CODE.PRODUCT_NOT_FOUND, 'Product not found');
    }

    if (taxBracketId) {
        const TaxBracket = DbConnectionManager.getTenantModel<ITaxSettingDoc>(
            MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXSETTING,
        );
        const isTaxBracketExist = await TaxBracket.exists({ _id: taxBracketId });
        if (!isTaxBracketExist) {
            throw new BadRequestError(ERROR_CODE.TAX_BRACKET_INVALID, 'Invalid Tax Bracket Found');
        }
    }

    const Inventory = DbConnectionManager.getTenantModel<IInventoryDoc>(
        MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.INVENTORY,
    );

    const mainOutlet = await getMainOutlet();

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

const getMainOutlet = async (): Promise<IOutletDoc> => {
    const mainOutletName = 'Main Outlet';
    const Outlet = DbConnectionManager.getTenantModel<IOutletDoc>(
        MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.OUTLET,
    );
    let mainOutlet = await Outlet.findOne({ name: mainOutletName });
    if (!mainOutlet) {
        mainOutlet = await Outlet.create({ name: mainOutletName });
    }
    return mainOutlet;
};
