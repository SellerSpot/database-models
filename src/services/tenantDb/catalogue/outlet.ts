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
    // to use in mongoose select()
    static fieldsToFetchString = OutletDbService.fieldsToFetch.join(' ');

    // get all outlets
    static getAllOutlet = async (): Promise<IOutletData[]> => {
        const Outlet = OutletDbService.getModal();
        const allOutlets = await Outlet.find({}).select(OutletDbService.fieldsToFetchString);

        // TEMPORARY - till main outlet creation is moved to db seen during initializtion
        if (!allOutlets) {
            const mainOutlet = await Outlet.create({
                name: 'Main Outlet',
                address: '12 A, New Raja Colony, Bheemanagar, Balajinagar, Trichy 1',
            });
            return [mainOutlet] as IOutletData[];
        }
        return allOutlets as IOutletData[];
    };
}
