import { IStoreCurrency } from '../../models/coreDb/StoreCurrency';
import { getObjectIdAsString } from '../../utilities';

// this is being used for type and collision safety and for easy to refer scope
export enum ESTORE_CURRENCY_CODES {
    INR,
    USD,
    EUR,
}

// create custom indexes that remains same on db swaps
export const getStoreCurrenciesSeed = (): IStoreCurrency[] => {
    return [
        {
            _id: getObjectIdAsString(getStoreCurrencyByCode('INR')),
            code: getStoreCurrencyByCode('INR'),
            name: 'Indian Rupee',
            symbol: '₹',
        },
        {
            _id: getObjectIdAsString(getStoreCurrencyByCode('USD')),
            code: getStoreCurrencyByCode('USD'),
            name: 'United States Dollar',
            symbol: '$',
        },
        {
            _id: getObjectIdAsString(getStoreCurrencyByCode('EUR')),
            code: getStoreCurrencyByCode('EUR'),
            name: 'Euro',
            symbol: '€',
        },
    ];
};

export const getStoreCurrencyByCode = (code: keyof typeof ESTORE_CURRENCY_CODES): string =>
    ESTORE_CURRENCY_CODES[ESTORE_CURRENCY_CODES[code]];

/**
 * @returns default store currency - currently INR is the default store currency
 */
export const getDefaultStoreCurrencyId = (): string =>
    getObjectIdAsString(getStoreCurrencyByCode('INR'));
