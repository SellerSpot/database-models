import { DbConnectionManager } from '../../configs/DbConnectionManager';
import { coreDbModels, MONGOOSE_MODELS } from '../../models';
import { getStoreCurrenciesSeed } from '../../seeds/coreDb/storeCurreny';

export const seedStoreCurrencies = async (): Promise<void> => {
    const StoreCurrency = DbConnectionManager.getCoreModel<coreDbModels.IStoreCurrencyDoc>(
        MONGOOSE_MODELS.CORE_DB.STORE_CURRENCY,
    );
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
