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
    static getModal = (): Model<IStockUnitDoc> =>
        DbConnectionManager.getTenantModel<IStockUnitDoc>(
            MONGOOSE_MODELS.TENANT_DB.CATALOGUE.STOCKUNIT,
        );

    // to convert to IStockUnitData
    static convertToIStockUnitDataFormat = (stockUnitDoc: IStockUnitDoc): IStockUnitData => {
        return {
            id: stockUnitDoc._id,
            name: stockUnitDoc.name,
            unit: stockUnitDoc.unit,
        };
    };

    private static seedDefaultStockUnits = async (): Promise<IStockUnitDoc[]> => {
        const StockUnit = StockUnitDbService.getModal();
        const seedStockUnits = await StockUnit.insertMany(defaultStockUnits, { lean: true });
        return seedStockUnits;
    };

    // // holds the fields to fetch when getting or populating the modal
    // static fieldsToFetch: Array<keyof IStockUnitData> = ['id', 'name', 'unit'];
    // // to use in mongoose select()
    // static fieldsToFetchString = StockUnitDbService.fieldsToFetch.join(' ');

    static createStockUnit = async (
        newStockUnit: ICreateStockUnitRequest,
    ): Promise<IStockUnitData> => {
        const StockUnit = StockUnitDbService.getModal();
        const isStockUnitExist = await StockUnit.exists({ name: newStockUnit.name });
        if (isStockUnitExist) {
            throw new BadRequestError(
                ERROR_CODE.STOCK_UNIT_NAME_INVALID,
                'Stock unit name already exist',
            );
        }
        const createdStockUnit = await StockUnit.create(newStockUnit);
        return StockUnitDbService.convertToIStockUnitDataFormat(createdStockUnit);
    };

    static searchStockUnit = async (query: string): Promise<IStockUnitData[]> => {
        const StockUnit = StockUnitDbService.getModal();
        const matchingStockUnits = await StockUnit.find({
            $or: [{ name: new RegExp(`^${query}`, 'i') }, { unit: new RegExp(`^${query}`, 'i') }],
        });
        return matchingStockUnits.map((stockUnit) =>
            StockUnitDbService.convertToIStockUnitDataFormat(stockUnit),
        );
    };

    static getAllStockUnit = async (): Promise<IStockUnitData[]> => {
        const StockUnit = StockUnitDbService.getModal();
        const allStockUnit = await StockUnit.find({});
        if (isEmpty(allStockUnit)) {
            const defaultStockUnits = await StockUnitDbService.seedDefaultStockUnits();
            return defaultStockUnits.map((stockUnit) =>
                StockUnitDbService.convertToIStockUnitDataFormat(stockUnit),
            );
        }
        return allStockUnit.map((stockUnit) =>
            StockUnitDbService.convertToIStockUnitDataFormat(stockUnit),
        );
    };

    static getStockUnit = async (brandId: string): Promise<IStockUnitData> => {
        const StockUnit = StockUnitDbService.getModal();
        const stockUnit = await StockUnit.findById(brandId);
        return StockUnitDbService.convertToIStockUnitDataFormat(stockUnit);
    };

    static editStockUnit = async (
        stockUnitId: string,
        stockUnitToUpdate: IEditStockUnitRequest,
    ): Promise<IStockUnitData> => {
        const StockUnit = StockUnitDbService.getModal();
        const updatedStockUnit = await StockUnit.findByIdAndUpdate(stockUnitId, stockUnitToUpdate, {
            new: true,
        });
        return StockUnitDbService.convertToIStockUnitDataFormat(updatedStockUnit);
    };

    static deleteStockUnit = async (stockUnit: string): Promise<void> => {
        const StockUnit = StockUnitDbService.getModal();
        await StockUnit.deleteOne({ _id: stockUnit });
    };
}
