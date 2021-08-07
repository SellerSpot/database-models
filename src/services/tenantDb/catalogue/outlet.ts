import { DbConnectionManager, MONGOOSE_MODELS } from '../../..';
import { IOutletDoc } from '../../../models/tenantDb/catalogueModels';
import { Model } from 'mongoose';
import { IOutletData } from '@sellerspot/universal-types';

export class OutletDbService {
    static getModal = (): Model<IOutletDoc> => {
        return DbConnectionManager.getTenantModel<IOutletDoc>(
            MONGOOSE_MODELS.TENANT_DB.CATALOGUE.OUTLET,
        );
    };

    // holds the fields to fetch when getting or populating the modal
    static fieldsToFetch: Array<keyof IOutletData> = ['id', 'name', 'address'];
    static fieldsToFetchString = OutletDbService.fieldsToFetch.join(' ');

    // get all outlets
    static getAllOutlet = async (): Promise<IOutletData[]> => {
        const Outlet = OutletDbService.getModal();
        const allBrands = await Outlet.find({}).select(OutletDbService.fieldsToFetch.join(' '));
        return allBrands as IOutletData[];
    };
}
