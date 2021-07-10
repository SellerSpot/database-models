import { IPlugin } from '../../models/coreDb';
import { EPLUGINS, getPluginByName } from '@sellerspot/universal-types';
import { getObjectIdAsString } from '../../utilities';

export const getPluginsSeed = (): IPlugin[] => {
    return [
        {
            _id: getObjectIdAsString(getPluginByName('POINT_OF_SALE')),
            name: 'Point of Sale',
            uniqueName: getPluginByName('POINT_OF_SALE'),
            isVisibleInPluginMenu: true,
            isVisibleInPluginStore: true,
            dependantPlugins: [getObjectIdAsString(getPluginByName('CATALOGUE'))],
            icon: getPluginByName('POINT_OF_SALE'), // later it could be resolved with static image  url from s3
            image: '', // need to replace with aws s3 url - for now it directly handled in frontend
            bannerImages: [], // need to update from s3
            longDescription:
                'Day to day store sales with inventory control and bill generation and printing.', // need to update long description
            shortDescription:
                'Day to day store sales with inventory control and bill generation and printing.',
        },
        {
            _id: getObjectIdAsString(EPLUGINS[EPLUGINS.CATALOGUE]),
            name: 'Catalogue',
            uniqueName: getPluginByName('CATALOGUE'),
            isVisibleInPluginMenu: true,
            isVisibleInPluginStore: false,
            dependantPlugins: [],
            icon: getPluginByName('CATALOGUE'), // later it could be resolved with static image  url from s3
            image: '', // need to replace with aws s3 url - for now it directly handled in frontend
            bannerImages: [], // need to update from s3
            longDescription: 'Centralised catalogue store for Point of sale and Ecommerce plugins', // need to update long description
            shortDescription: 'Centralised catalogue store for Point of sale and Ecommerce plugins',
        },
    ];
};
