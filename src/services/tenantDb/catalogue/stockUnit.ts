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

export class StockUnitDbService {
    static getModal = (): Model<IStockUnitDoc> => {
        return DbConnectionManager.getTenantModel<IStockUnitDoc>(
            MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT,
        );
    };

    static createStockUnit = async (
        newStockUnit: ICreateStockUnitRequest,
    ): Promise<IStockUnitDoc> => {
        const { name } = newStockUnit;
        const StockUnit = StockUnitDbService.getModal();
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

    static searchStockUnit = async (query: string): Promise<IStockUnitDoc[]> => {
        const StockUnit = StockUnitDbService.getModal();
        const matchingStockUnits = await StockUnit.find({
            $or: [{ name: new RegExp(`^${query}`, 'i') }, { unit: new RegExp(`^${query}`, 'i') }],
        });
        return matchingStockUnits;
    };

    static getAllStockUnit = async (): Promise<IStockUnitDoc[]> => {
        const StockUnit = StockUnitDbService.getModal();
        let allStockUnit = await StockUnit.find({});
        if (isEmpty(allStockUnit))
            allStockUnit = await StockUnitDbService.insertDefaultStockUnit(StockUnit);
        return allStockUnit;
    };

    static getStockUnit = async (brandId: string): Promise<IStockUnitDoc> => {
        const StockUnit = StockUnitDbService.getModal();
        const stockUnit = await StockUnit.findById(brandId);
        return stockUnit;
    };

    static editStockUnit = async (
        stockUnitId: string,
        updatedStockUnit: IEditStockUnitRequest,
    ): Promise<IStockUnitDoc> => {
        const StockUnit = StockUnitDbService.getModal();
        const stock = await StockUnit.findByIdAndUpdate(stockUnitId, updatedStockUnit, {
            new: true,
        });
        return stock;
    };

    static deleteStockUnit = async (stockUnit: string): Promise<void> => {
        const StockUnit = StockUnitDbService.getModal();
        await StockUnit.deleteOne({ _id: stockUnit });
    };

    private static insertDefaultStockUnit = async (
        StockUnit: Model<IStockUnitDoc>,
    ): Promise<IStockUnitDoc[]> => {
        const stockUnits = await StockUnit.insertMany(defaultStockUnits, { lean: true });
        return stockUnits;
    };
}
