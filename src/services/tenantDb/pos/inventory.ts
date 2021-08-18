import { BadRequestError, logger } from '@sellerspot/universal-functions';
import {
    ERROR_CODE,
    IAddProductToInventoryRequest,
    ICategoryData,
    IEditProductInInventoryRequest,
    IInventoryData,
    IProductData,
    ISearchInventoryProductsResponse,
    ISearchInventoryQueryParam,
} from '@sellerspot/universal-types';
import { differenceWith, groupBy, isUndefined } from 'lodash';
import { Model, PopulateOptions, Types } from 'mongoose';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import {
    IBrandDoc,
    IOutletDoc,
    IProductDoc,
    IStockUnitDoc,
    ITaxBracketDoc,
} from '../../../models/tenantDb/catalogueModels';
import { IInventoryDoc } from '../../../models/tenantDb/pointOfSaleModels/Inventory';
import { BrandService, ProductService, StockUnitService, TaxBracketService } from '../catalogue';
import { OutletService } from '../catalogue/Outlet';

export class InventoryService {
    static getModal = (): Model<IInventoryDoc> =>
        DbConnectionManager.getTenantModel<IInventoryDoc>(
            MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.INVENTORY,
        );

    static getInventoryDefaultPopulationList = (): PopulateOptions[] => {
        const populateArrOpts: PopulateOptions[] = [];
        populateArrOpts.push({
            path: 'product.reference',
            populate: ProductService.getProductDefaultPopulationList(),
        });
        populateArrOpts.push({
            path: 'taxBracket',
            populate: TaxBracketService.getTaxGroupPopulateOptions(),
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
                const configurationData: IInventoryData['outlets'][0] = {
                    outlet: OutletService.convertToIOutletDataFormat(
                        productOutletInformation[0].outlet as IOutletDoc,
                    ),
                    isActive: productOutletInformation[0].isActive,
                    isTrack: productOutletInformation[0].isTrack,
                    landingCost: productOutletInformation[0].landingCost,
                    markup: productOutletInformation[0].markup,
                    mrp: productOutletInformation[0].mrp,
                    sellingPrice: productOutletInformation[0].sellingPrice,
                    stock: productOutletInformation[0].stock,
                    taxBracket: !isUndefined(
                        (productOutletInformation[0].taxBracket as ITaxBracketDoc).group,
                    )
                        ? TaxBracketService.convertToITaxGroupDataFormat(
                              productOutletInformation[0].taxBracket as ITaxBracketDoc,
                          )
                        : TaxBracketService.convertToITaxBracketDataFormat(
                              productOutletInformation[0].taxBracket as ITaxBracketDoc,
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
                        brand: BrandService.convertToIBrandDataFormat(
                            (productOutletInformation[0].product.reference as IProductDoc)
                                .brand as IBrandDoc,
                        ),
                        category: (productOutletInformation[0].product.reference as IProductDoc)
                            .category as ICategoryData,
                        stockUnit: StockUnitService.convertToIStockUnitDataFormat(
                            (productOutletInformation[0].product.reference as IProductDoc)
                                .stockUnit as IStockUnitDoc,
                        ),
                        outlets: {},
                    };
                }
                // on subsequent iterations, only push config data
                inventoryData.outlets[outletId] = configurationData;
            });

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
        const Inventory = InventoryService.getModal();
        const filterQuery = <{ [key: string]: string | RegExp }>{};
        if (outletId) {
            filterQuery['outlet'] = outletId;
        } else if (productId) {
            filterQuery['product.reference'] = productId;
        }
        const allInventoryDocs = await Inventory.find(filterQuery).populate(
            InventoryService.getInventoryDefaultPopulationList(),
        );
        return InventoryService.convertToIInventoryDataFormat(allInventoryDocs);
    };

    // search for products in inventory
    static searchInventoryProducts = async (
        query: string,
        outletId: string,
        lookup: ISearchInventoryQueryParam['lookup'] = 'all',
    ): Promise<{
        inventory?: IInventoryData[];
        catalogue?: IProductData[];
    }> => {
        const Inventory = InventoryService.getModal();
        const CatalogueProduct = ProductService.getModal();

        let matchingCatalogueProducts: IProductDoc[] = [];
        let matchingInventoryProducts: IInventoryDoc[] = [];

        let [inventory, catalogue]: [IInventoryData[], IProductData[]] = [[], []];

        const searchQueryRegExp = new RegExp(`^${query}`, 'i');

        // if product does not exists in catalogue, no use searching in inventory
        if ((<typeof lookup[]>['all', 'catalogue']).includes(lookup)) {
            matchingCatalogueProducts = await CatalogueProduct.find({
                name: searchQueryRegExp,
            }).populate(ProductService.getProductDefaultPopulationList());
        }

        if ((<typeof lookup[]>['all', 'inventory']).includes(lookup)) {
            const inventoryFilterQuery = <{ [key: string]: string | RegExp }>{
                'product.name': searchQueryRegExp,
            };
            if (outletId) {
                inventoryFilterQuery['outlet'] = outletId;
            }
            matchingInventoryProducts = await Inventory.find(inventoryFilterQuery).populate(
                InventoryService.getInventoryDefaultPopulationList(),
            );
        }

        // returning error if the product does not exist in inventory
        if (lookup === 'inventory') {
            inventory = InventoryService.convertToIInventoryDataFormat(matchingInventoryProducts);
        } else if (lookup === 'catalogue') {
            catalogue = matchingCatalogueProducts.map((catalogueProduct) =>
                ProductService.convertToIProductDataFormat(catalogueProduct),
            );
        } else {
            inventory = InventoryService.convertToIInventoryDataFormat(matchingInventoryProducts);
            catalogue = differenceWith(
                matchingCatalogueProducts,
                matchingInventoryProducts,
                (catalogueProduct, inventoryProduct) => {
                    return catalogueProduct.name === inventoryProduct.product.name;
                },
            ).map((catalogueProduct) => {
                return ProductService.convertToIProductDataFormat(catalogueProduct);
            });
        }

        // returns the result
        return {
            inventory,
            catalogue,
        };
    };

    // to edit an already present product in inventory
    static editProductInInventory = async (
        inventoryProps: IEditProductInInventoryRequest,
    ): Promise<IInventoryData> => {
        const updatedCollectionOfProducts: IInventoryDoc[] = [];
        // performing checks on passed values
        const Outlet = OutletService.getModal();
        const TaxSetting = TaxBracketService.getModal();
        const Inventory = InventoryService.getModal();
        // checking product data
        const productData = await Inventory.exists({
            'product.reference': inventoryProps.productId,
        });
        if (!productData) {
            throw new BadRequestError(ERROR_CODE.PRODUCT_NOT_FOUND, 'Product not found');
        }
        await Promise.all(
            inventoryProps.outlets.map(async (currOutlet) => {
                const outletConfiguration = currOutlet;
                const { outlet, taxBracket } = outletConfiguration;
                // checking outlet data
                const isOutletExist = await Outlet.exists({ _id: outlet });
                if (!isOutletExist) {
                    throw new BadRequestError(
                        ERROR_CODE.OUTLET_INVALID_OUTLET,
                        'Invalid Outlet Found',
                    );
                }

                // checking tax settings data
                if (taxBracket) {
                    const isTaxSettingExist = await TaxSetting.exists({
                        _id: taxBracket,
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
            inventoryProps.outlets.map(async (currOutlet) => {
                const outletConfiguration = currOutlet;
                const {
                    outlet,
                    isActive,
                    isTrack,
                    landingCost,
                    markup,
                    mrp,
                    sellingPrice,
                    stock,
                    taxBracket,
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
                        taxBracket: taxBracket as string,
                    },
                    {
                        new: true,
                    },
                ).populate(InventoryService.getInventoryDefaultPopulationList());
                updatedCollectionOfProducts.push(updatedDoc);
            }),
        );
        return InventoryService.convertToIInventoryDataFormat(updatedCollectionOfProducts)[0];
    };

    // add a new product to inventory
    static addProductToInventory = async (
        inventoryProps: IAddProductToInventoryRequest,
    ): Promise<IInventoryData[]> => {
        // getting modals
        const Product = ProductService.getModal();
        const Outlet = OutletService.getModal();
        const TaxSetting = TaxBracketService.getModal();
        const Inventory = InventoryService.getModal();

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
            inventoryProps.outlets.map(async (currOutlet) => {
                const outletConfiguration = currOutlet;
                const {
                    mrp,
                    sellingPrice,
                    isTrack = true,
                    landingCost,
                    markup,
                    stock,
                    outlet,
                    isActive = true,
                    taxBracket,
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
                if (taxBracket) {
                    const isTaxSettingExist = await TaxSetting.exists({
                        _id: taxBracket,
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
                    stock,
                    isTrack,
                    markup,
                    isActive,
                    mrp,
                    landingCost,
                    sellingPrice,
                    taxBracket: Types.ObjectId(taxBracket as string),
                    outlet: Types.ObjectId(outlet as string),
                });

                const newInventoryProduct = await newInventoryProductDoc
                    .populate(InventoryService.getInventoryDefaultPopulationList())
                    .execPopulate();

                // pushing into array to send back to client
                createdCollectionOfProducts.push(newInventoryProduct);
            }),
        );
        return InventoryService.convertToIInventoryDataFormat(createdCollectionOfProducts);
    };

    // delete product data from inventory
    static deleteProductFromInventory = async (
        productId: string,
        outletId: string,
    ): Promise<void> => {
        const Inventory = InventoryService.getModal();
        const filterQuery = <{ [key: string]: string }>{
            'product.reference': productId,
        };
        if (outletId) {
            filterQuery['outlet'] = outletId;
        }
        await Inventory.deleteMany(filterQuery);
    };
}
