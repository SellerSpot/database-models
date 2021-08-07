import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { IStockUnitDoc } from '../../../models/tenantDb/catalogueModels';
import {
    ERROR_CODE,
    ICreateStockUnitRequest,
    IEditStockUnitRequest,
    IStockUnitData,
} from '@sellerspot/universal-types';
import { BadRequestError } from '@sellerspot/universal-functions';
import { defaultStockUnits } from '../../../seeds/tenantDb/catalogue/StockUnit';
import { isEmpty, pick } from 'lodash';
import { Model } from 'mongoose';

export class StockUnitDbService {
    static getModal = (): Model<IStockUnitDoc> => {
        return DbConnectionManager.getTenantModel<IStockUnitDoc>(
            MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT,
        );
    };

    private static insertDefaultStockUnit = async (
        StockUnit: Model<IStockUnitDoc>,
    ): Promise<IStockUnitData[]> => {
        const stockUnits = await StockUnit.insertMany(defaultStockUnits, { lean: true });
        return stockUnits.map((stockUnit) =>
            pick(stockUnit, StockUnitDbService.fieldsToFetch),
        ) as IStockUnitData[];
    };

    // holds the fields to fetch when getting or populating the modal
    static fieldsToFetch: Array<keyof IStockUnitData> = ['id', 'name', 'unit'];
    // to use in mongoose select()
    static fieldsToFetchString = StockUnitDbService.fieldsToFetch.join(' ');

    static createStockUnit = async (
        newStockUnit: ICreateStockUnitRequest,
    ): Promise<IStockUnitData> => {
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
        return pick(stockUnit, StockUnitDbService.fieldsToFetch);
    };

    static searchStockUnit = async (query: string): Promise<IStockUnitData[]> => {
        const StockUnit = StockUnitDbService.getModal();
        const matchingStockUnits = await StockUnit.find({
            $or: [{ name: new RegExp(`^${query}`, 'i') }, { unit: new RegExp(`^${query}`, 'i') }],
        }).select(StockUnitDbService.fieldsToFetchString);
        return matchingStockUnits;
    };

    static getAllStockUnit = async (): Promise<IStockUnitData[]> => {
        const StockUnit = StockUnitDbService.getModal();
        let allStockUnit: IStockUnitData[] = await StockUnit.find({}).select(
            StockUnitDbService.fieldsToFetch,
        );
        if (isEmpty(allStockUnit)) {
            allStockUnit = await StockUnitDbService.insertDefaultStockUnit(StockUnit);
        }
        return allStockUnit;
    };

    static getStockUnit = async (brandId: string): Promise<IStockUnitData> => {
        const StockUnit = StockUnitDbService.getModal();
        const stockUnit = await StockUnit.findById(brandId).select(
            StockUnitDbService.fieldsToFetchString,
        );
        return stockUnit;
    };

    static editStockUnit = async (
        stockUnitId: string,
        updatedStockUnit: IEditStockUnitRequest,
    ): Promise<IStockUnitData> => {
        const StockUnit = StockUnitDbService.getModal();
        const stock = await StockUnit.findByIdAndUpdate(stockUnitId, updatedStockUnit, {
            new: true,
        }).select(StockUnitDbService.fieldsToFetchString);
        return stock;
    };

    static deleteStockUnit = async (stockUnit: string): Promise<void> => {
        const StockUnit = StockUnitDbService.getModal();
        await StockUnit.deleteOne({ _id: stockUnit });
    };
}
