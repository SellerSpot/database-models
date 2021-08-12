import { BadRequestError, logger } from '@sellerspot/universal-functions';
import {
    ERROR_CODE,
    IAddProductToInventoryRequest,
    IBrandData,
    ICategoryData,
    IEditProductInInventoryRequest,
    IInventoryData,
    IInventoryDataDynamic,
    IOutletData,
    IProductData,
    ITaxSettingData,
} from '@sellerspot/universal-types';
import { groupBy, pick } from 'lodash';
import { Model, PopulateOptions, Types } from 'mongoose';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import {
    IBrandDoc,
    IOutletDoc,
    IProductDoc,
    IStockUnitDoc,
    ITaxSettingDoc,
} from '../../../models/tenantDb/catalogueModels';
import { IInventoryDoc } from '../../../models/tenantDb/pointOfSaleModels/Inventory';
import {
    BrandDbService,
    ProductDbService,
    StockUnitDbService,
    TaxSettingDbService,
} from '../catalogue';
import { OutletDbService } from '../catalogue/outlet';

export class InventoryDbService {
    static getModal = (): Model<IInventoryDoc> =>
        DbConnectionManager.getTenantModel<IInventoryDoc>(
            MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.INVENTORY,
        );

    // // holds the fields to fetch when getting or populating the modal
    // static fieldsToFetch: Array<keyof IInventoryData> &
    //     Array<keyof IInventoryData['configurations']> = [
    //     'id',
    //     'isActive',
    //     'isTrack',
    //     'landingCost',
    //     'markup',
    //     'markup',
    //     'mrp',
    //     'outlet',
    //     'product',
    //     'sellingPrice',
    //     'stock',
    //     'tags',
    //     'taxSetting',
    // ];
    // // to use in mongoose select()
    // static fieldsToFetchString = InventoryDbService.fieldsToFetch.join(' ');

    static getInventoryDefaultPopulationList = (): PopulateOptions[] => {
        const populateArrOpts: PopulateOptions[] = [];
        populateArrOpts.push({
            path: 'product.reference',
            populate: ProductDbService.getProductDefaultPopulationList(),
        });
        populateArrOpts.push({
            path: 'taxSetting',
            populate: TaxSettingDbService.getDefaultPopulateOptions(),
        });
        populateArrOpts.push({ path: 'outlet' });
        return populateArrOpts;
    };

    // to convert to IInventoryData
    static convertToIInventoryDataFormat = (inventoryDoc: IInventoryDoc[]): IInventoryData[] => {
        // holds the final list of inventory products to return
        const inventoryDataArr: IInventoryData[] = [];
        // first grouping by product id so as to group up all details of each product
        const groupedBasedOnProductId = groupBy(inventoryDoc, 'product.reference._id');
        // iterating through each product
        Object.keys(groupedBasedOnProductId).map((productId) => {
            // holds the inventoryData for current product
            let inventoryData: IInventoryData;
            // grouping all information based on outlet
            const groupedBasedOnOutletId = groupBy(groupedBasedOnProductId[productId], 'outlet.id');
            // iterating through each outlet for the product
            Object.keys(groupedBasedOnOutletId).map((outletId, index) => {
                // getting data of current outlet
                const productOutletInformation = groupedBasedOnOutletId[outletId];
                // compiling config data here for D.R.Y in the below statements
                const configurationData: IInventoryDataDynamic = {
                    outlet: OutletDbService.convertToIOutletDataFormat(
                        productOutletInformation[0].outlet as IOutletDoc,
                    ),
                    isActive: productOutletInformation[0].isActive,
                    isTrack: productOutletInformation[0].isTrack,
                    landingCost: productOutletInformation[0].landingCost,
                    markup: productOutletInformation[0].markup,
                    mrp: productOutletInformation[0].mrp,
                    sellingPrice: productOutletInformation[0].sellingPrice,
                    stock: productOutletInformation[0].stock,
                    taxSetting: TaxSettingDbService.convertToITaxSettingDataFormat(
                        productOutletInformation[0].taxSetting as ITaxSettingDoc,
                    ),
                };
                // on first iteration, push the static values of the product
                if (index === 0) {
                    inventoryData = {
                        id: (productOutletInformation[0].product.reference as IProductDoc).id,
                        name: (productOutletInformation[0].product.reference as IProductDoc).name,
                        description: (productOutletInformation[0].product.reference as IProductDoc)
                            .description,
                        barcode: (productOutletInformation[0].product.reference as IProductDoc)
                            .barcode,
                        tags: productOutletInformation[0].tags,
                        brand: BrandDbService.convertToIBrandDataFormat(
                            (productOutletInformation[0].product.reference as IProductDoc)
                                .brand as IBrandDoc,
                        ),
                        category: (productOutletInformation[0].product.reference as IProductDoc)
                            .category as ICategoryData,
                        stockUnit: StockUnitDbService.convertToIStockUnitDataFormat(
                            (productOutletInformation[0].product.reference as IProductDoc)
                                .stockUnit as IStockUnitDoc,
                        ),
                        configurations: {},
                    };
                }
                // on subsequent iterations, only push config data
                inventoryData.configurations[outletId] = configurationData;
                // and create a unique set of combined tags
                inventoryData.tags = [
                    ...new Set([...productOutletInformation[0].tags, ...inventoryData.tags]),
                ];
            });
            // if (productId === '611228dee6adc1394ca9e3af') {
            //     logger.info(inventoryData);
            // }
            // pushing current product inventory data to main array
            inventoryDataArr.push(inventoryData);
        });
        return inventoryDataArr;
    };

    // get all products from inventory
    static getAllInventoryProducts = async (props: {
        outletId?: string;
        productId?: string;
    }): Promise<IInventoryData[]> => {
        // props
        const { outletId, productId } = props;
        const Inventory = InventoryDbService.getModal();
        const filterQuery = <{ [key: string]: string | RegExp }>{};
        if (outletId) {
            filterQuery['outlet'] = outletId;
        } else if (productId) {
            filterQuery['product.reference'] = productId;
        }
        const allInventoryDocs = await Inventory.find(filterQuery).populate(
            InventoryDbService.getInventoryDefaultPopulationList(),
        );
        return InventoryDbService.convertToIInventoryDataFormat(allInventoryDocs);
    };

    // search for products in inventory
    static searchInventoryProducts = async (
        query: string,
        outletId: string,
    ): Promise<IInventoryData[]> => {
        const Inventory = InventoryDbService.getModal();
        const filterQuery = <{ [key: string]: string | RegExp }>{
            'product.name': new RegExp(`^${query}`, 'i'),
        };
        if (outletId) {
            filterQuery['outlet'] = outletId;
        }
        const matchingProducts = await Inventory.find(filterQuery).populate(
            InventoryDbService.getInventoryDefaultPopulationList(),
        );
        return InventoryDbService.convertToIInventoryDataFormat(matchingProducts);
    };

    // to edit an already present product in inventory
    static editProductInInventory = async (
        inventoryProps: IEditProductInInventoryRequest,
    ): Promise<IInventoryData> => {
        const updatedCollectionOfProducts: IInventoryDoc[] = [];
        // performing checks on passed values
        const Outlet = OutletDbService.getModal();
        const TaxSetting = TaxSettingDbService.getModal();
        const Inventory = InventoryDbService.getModal();
        // checking product data
        const productData = await Inventory.exists({
            'product.reference': inventoryProps.productId,
        });
        if (!productData) {
            throw new BadRequestError(ERROR_CODE.PRODUCT_NOT_FOUND, 'Product not found');
        }
        // currOutletIndex because it returns 0, 1, 2 ... due to general type definition
        await Promise.all(
            Object.keys(inventoryProps.configurations).map(async (currOutletIndex) => {
                const outletConfiguration = inventoryProps.configurations[currOutletIndex];
                const { outlet, taxSetting } = outletConfiguration;
                // checking outlet data
                const isOutletExist = await Outlet.exists({ _id: outlet });
                if (!isOutletExist) {
                    throw new BadRequestError(
                        ERROR_CODE.OUTLET_INVALID_OUTLET,
                        'Invalid Outlet Found',
                    );
                }

                // checking tax settings data
                if (taxSetting) {
                    const isTaxSettingExist = await TaxSetting.exists({
                        _id: taxSetting,
                    });
                    if (!isTaxSettingExist) {
                        throw new BadRequestError(
                            ERROR_CODE.TAX_BRACKET_INVALID,
                            'Invalid Tax Bracket Found',
                        );
                    }
                }
            }),
        );

        // checks completed - now updating all required instances
        await Promise.all(
            Object.keys(inventoryProps.configurations).map(async (currOutletIndex) => {
                const outletConfiguration = inventoryProps.configurations[currOutletIndex];
                const {
                    outlet,
                    isActive,
                    isTrack,
                    landingCost,
                    markup,
                    mrp,
                    sellingPrice,
                    stock,
                    taxSetting,
                } = outletConfiguration;

                const updatedDoc = await Inventory.findOneAndUpdate(
                    { 'product.reference': inventoryProps.productId, outlet: outlet as string },
                    {
                        isActive,
                        isTrack,
                        landingCost,
                        markup,
                        mrp,
                        sellingPrice,
                        stock,
                        taxSetting: taxSetting as string,
                    },
                    {
                        new: true,
                    },
                ).populate(InventoryDbService.getInventoryDefaultPopulationList());
                updatedCollectionOfProducts.push(updatedDoc);
            }),
        );
        return InventoryDbService.convertToIInventoryDataFormat(updatedCollectionOfProducts)[0];
    };

    // add a new product to inventory
    static addProductToInventory = async (
        inventoryProps: IAddProductToInventoryRequest,
    ): Promise<IInventoryData[]> => {
        // getting modals
        const Product = ProductDbService.getModal();
        const Outlet = OutletDbService.getModal();
        const TaxSetting = TaxSettingDbService.getModal();
        const Inventory = InventoryDbService.getModal();

        // checking product data
        const productData = await Product.findById(inventoryProps.productId);
        if (!productData) {
            throw new BadRequestError(ERROR_CODE.PRODUCT_NOT_FOUND, 'Product not found');
        }
        // getting product name for denormalisation (cause this is a search tag)
        const productName = productData.name;
        const createdCollectionOfProducts: IInventoryDoc[] = [];

        // iterating throught each outlet configuration
        await Promise.all(
            // currOutletIndex because it returns 0, 1, 2 ... due to general type definition
            Object.keys(inventoryProps.configurations).map(async (currOutletIndex) => {
                const outletConfiguration = inventoryProps.configurations[currOutletIndex];
                const {
                    mrp,
                    sellingPrice,
                    isTrack = true,
                    landingCost,
                    markup,
                    stock,
                    outlet,
                    isActive = true,
                    taxSetting,
                } = outletConfiguration;

                // checking outlet data
                const isOutletExist = await Outlet.exists({ _id: outlet });
                if (!isOutletExist) {
                    throw new BadRequestError(
                        ERROR_CODE.OUTLET_INVALID_OUTLET,
                        'Invalid Outlet Found',
                    );
                }

                // checking tax settings data
                if (taxSetting) {
                    const isTaxSettingExist = await TaxSetting.exists({
                        _id: taxSetting,
                    });
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
                        reference: Types.ObjectId(inventoryProps.productId),
                    },
                    tags: inventoryProps.tags,
                    stock,
                    isTrack,
                    markup,
                    isActive,
                    mrp,
                    landingCost,
                    sellingPrice,
                    taxSetting: Types.ObjectId(taxSetting as string),
                    outlet: Types.ObjectId(outlet as string),
                });

                const newInventoryProduct = await newInventoryProductDoc
                    .populate(InventoryDbService.getInventoryDefaultPopulationList())
                    .execPopulate();

                // pushing into array to send back to client
                createdCollectionOfProducts.push(newInventoryProduct);
            }),
        );
        return InventoryDbService.convertToIInventoryDataFormat(createdCollectionOfProducts);
    };

    // delete product data from inventory
    static deleteProductFromInventory = async (
        productId: string,
        outletId: string,
    ): Promise<void> => {
        const Inventory = InventoryDbService.getModal();
        const filterQuery = <{ [key: string]: string }>{
            'product.reference': productId,
        };
        if (outletId) {
            filterQuery['outlet'] = outletId;
        }
        await Inventory.deleteMany(filterQuery);
    };
}
