import { IStoreCurrency } from '../../models/coreDb/StoreCurrency';
import { getObjectIdAsString } from '../../utilities';

const storeCurrencies: IStoreCurrency[] = [
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
