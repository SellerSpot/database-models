import { DbConnectionManager } from '../../configs/DbConnectionManager';
import { coreDbModels, MONGOOSE_MODELS } from '../../models';
import { IStoreCurrency } from '../../models/coreDb';
import { getStoreCurrenciesSeed } from '../../seeds/coreDb/storeCurreny';

/**
 *
 * @returns the store currency model
 */
const getStoreCurrencyModel = () =>
    DbConnectionManager.getCoreModel<coreDbModels.IStoreCurrencyDoc>(
        MONGOOSE_MODELS.CORE_DB.STORE_CURRENCY,
    );

/**
 * seeds the store currencies into storeCurrency collection
 */
export const seedStoreCurrencies = async (): Promise<void> => {
    const StoreCurrency = getStoreCurrencyModel();
    const seeds = getStoreCurrenciesSeed();
    await StoreCurrency.bulkWrite(
        seeds.map((seed) => ({
            updateOne: {
                filter: { _id: seed._id },
                update: { $set: seed },
                upsert: true,
                new: true,
            },
        })),
    );
};

/**
 *
 * @returns all store currencies
 */
export const getAllStoreCurrencies = async (): Promise<IStoreCurrency[]> => {
    const StoreCurrency = getStoreCurrencyModel();
    const storeCurrencies = await StoreCurrency.find();
    return storeCurrencies;
};
