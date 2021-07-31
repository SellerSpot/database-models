import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { IStockUnitDoc } from '../../../models/tenantDb/catalogueModels';
import {
    ERROR_CODE,
    ICreateStockUnitRequest,
    IEditStockUnitRequest,
} from '@sellerspot/universal-types';
import { BadRequestError } from '@sellerspot/universal-functions';
import { defaultStockUnits } from '../../../seeds/tenantDb/catalogue/StockUnit';
import { isEmpty } from 'lodash';
import { Model } from 'mongoose';

export const createStockUnit = async (
    newStockUnit: ICreateStockUnitRequest,
): Promise<IStockUnitDoc> => {
    const { name } = newStockUnit;
    const StockUnit = DbConnectionManager.getTenantModel<IStockUnitDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT,
    );
    const isStockUnitExist = await StockUnit.exists({ name });
    if (isStockUnitExist) {
        throw new BadRequestError(
            ERROR_CODE.STOCK_UNIT_NAME_INVALID,
            'Stock unit name already exist',
        );
    }
    const stockUnit = await StockUnit.create(newStockUnit);
    return stockUnit;
};

export const searchStockUnit = async (query: string): Promise<IStockUnitDoc[]> => {
    const StockUnit = DbConnectionManager.getTenantModel<IStockUnitDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT,
    );
    const matchingStockUnits = await StockUnit.find({
        $or: [{ name: new RegExp(`^${query}`, 'i') }, { unit: new RegExp(`^${query}`, 'i') }],
    });
    return matchingStockUnits;
};

export const getAllStockUnit = async (): Promise<IStockUnitDoc[]> => {
    const StockUnit = DbConnectionManager.getTenantModel<IStockUnitDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT,
    );
    let allStockUnit = await StockUnit.find({});
    if (isEmpty(allStockUnit)) allStockUnit = await insertDefaultStockUnit(StockUnit);
    return allStockUnit;
};

export const getStockUnit = async (brandId: string): Promise<IStockUnitDoc> => {
    const StockUnit = DbConnectionManager.getTenantModel<IStockUnitDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT,
    );
    const stockUnit = await StockUnit.findById(brandId);
    return stockUnit;
};

export const editStockUnit = async (
    stockUnitId: string,
    updatedStockUnit: IEditStockUnitRequest,
): Promise<IStockUnitDoc> => {
    const StockUnit = DbConnectionManager.getTenantModel<IStockUnitDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT,
    );
    const stock = await StockUnit.findByIdAndUpdate(stockUnitId, updatedStockUnit, {
        new: true,
    });
    return stock;
};

export const deleteStockUnit = async (stockUnit: string): Promise<void> => {
    const StockUnit = DbConnectionManager.getTenantModel<IStockUnitDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT,
    );
    await StockUnit.deleteOne({ _id: stockUnit });
};

const insertDefaultStockUnit = async (
    StockUnit: Model<IStockUnitDoc>,
): Promise<IStockUnitDoc[]> => {
    const stockUnits = await StockUnit.insertMany(defaultStockUnits, { lean: true });
    return stockUnits;
};
