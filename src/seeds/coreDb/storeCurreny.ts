import { IStoreCurrency } from '../../models/coreDb/StoreCurrency';
import { getObjectIdAsString } from '../../utilities';

// this is being used for type and collision safety and easy to refer scope
export enum ESTORE_CURRENCY_CODES {
    INR,
    USD,
    EUR,
}

const storeCurrencies: (IStoreCurrency & { code: keyof typeof ESTORE_CURRENCY_CODES })[] = [
    {
        name: 'Indian Rupee',
        code: 'INR',
        symbol: '₹',
    },
    {
        name: 'United States Dollar',
        code: 'USD',
        symbol: '$',
    },
    {
        name: 'Euro',
        code: 'EUR',
        symbol: '€',
    },
];

// insert _id's into storCurrencies object programatically, to avoid manual error
export const getStoreCurrenciesSeed = (): IStoreCurrency[] =>
    storeCurrencies.map((storeCurrency) => {
        storeCurrency._id = getObjectIdAsString(storeCurrency.code);
        return storeCurrency;
    });

export const getStoreCurrencyByCode = (code: keyof typeof ESTORE_CURRENCY_CODES): string =>
    ESTORE_CURRENCY_CODES[ESTORE_CURRENCY_CODES[code]];

/**
 * @returns default store currency - currently INR is the default store currency
 */
export const getDefaultStoreCurrencyId = (): string =>
    getObjectIdAsString(ESTORE_CURRENCY_CODES[ESTORE_CURRENCY_CODES.INR]);
