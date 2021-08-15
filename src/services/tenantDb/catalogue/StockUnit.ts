import { isEmpty, pick } from 'lodash';
import { Model } from 'mongoose';
import { BadRequestError, logger } from '@sellerspot/universal-functions';
import {
    ERROR_CODE,
    ICreateStockUnitRequest,
    IEditStockUnitRequest,
    IStockUnitData,
} from '@sellerspot/universal-types';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { IStockUnitDoc } from '../../../models/tenantDb/catalogueModels';
import { defaultStockUnits } from '../../../seeds/tenantDb/catalogue/StockUnit';

export class StockUnitService {
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

    static seedDefaultStockUnits = async (): Promise<IStockUnitDoc[]> => {
        const StockUnit = StockUnitService.getModal();
        const seedStockUnits = await StockUnit.insertMany(defaultStockUnits, { lean: true });
        logger.info('Stock Units seeded successfully');
        return seedStockUnits;
    };

    // holds the fields to fetch when getting or populating the modal
    static fieldsToFetch: Array<keyof IStockUnitData> = ['id', 'name', 'unit'];
    // to use in mongoose select()
    static fieldsToFetchString = StockUnitService.fieldsToFetch.join(' ');

    static createStockUnit = async (
        newStockUnit: ICreateStockUnitRequest,
    ): Promise<IStockUnitData> => {
        const StockUnit = StockUnitService.getModal();
        const isStockUnitExist = await StockUnit.exists({ name: newStockUnit.name });
        if (isStockUnitExist) {
            throw new BadRequestError(
                ERROR_CODE.STOCK_UNIT_NAME_INVALID,
                'Stock unit name already exist',
            );
        }
        const createdStockUnit = await StockUnit.create(newStockUnit);
        return StockUnitService.convertToIStockUnitDataFormat(createdStockUnit);
    };

    static searchStockUnit = async (query: string): Promise<IStockUnitData[]> => {
        const StockUnit = StockUnitService.getModal();
        const matchingStockUnits = await StockUnit.find({
            $or: [{ name: new RegExp(`^${query}`, 'i') }, { unit: new RegExp(`^${query}`, 'i') }],
        });
        return matchingStockUnits.map((stockUnit) =>
            StockUnitService.convertToIStockUnitDataFormat(stockUnit),
        );
    };

    static getAllStockUnit = async (): Promise<IStockUnitData[]> => {
        const StockUnit = StockUnitService.getModal();
        const allStockUnit = await StockUnit.find({});
        if (isEmpty(allStockUnit)) {
            const defaultStockUnits = await StockUnitService.seedDefaultStockUnits();
            return defaultStockUnits.map((stockUnit) =>
                StockUnitService.convertToIStockUnitDataFormat(stockUnit),
            );
        }
        return allStockUnit.map((stockUnit) =>
            StockUnitService.convertToIStockUnitDataFormat(stockUnit),
        );
    };

    static getStockUnit = async (brandId: string): Promise<IStockUnitData> => {
        const StockUnit = StockUnitService.getModal();
        const stockUnit = await StockUnit.findById(brandId);
        return StockUnitService.convertToIStockUnitDataFormat(stockUnit);
    };

    static editStockUnit = async (
        stockUnitId: string,
        stockUnitToUpdate: IEditStockUnitRequest,
    ): Promise<IStockUnitData> => {
        const StockUnit = StockUnitService.getModal();
        const updatedStockUnit = await StockUnit.findByIdAndUpdate(stockUnitId, stockUnitToUpdate, {
            new: true,
        });
        return StockUnitService.convertToIStockUnitDataFormat(updatedStockUnit);
    };

    static deleteStockUnit = async (stockUnit: string): Promise<void> => {
        const StockUnit = StockUnitService.getModal();
        await StockUnit.deleteOne({ _id: stockUnit });
    };
}
