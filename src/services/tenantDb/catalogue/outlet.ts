import { BadRequestError } from '@sellerspot/universal-functions';
import { ERROR_CODE, IOutletData } from '@sellerspot/universal-types';
import { Model } from 'mongoose';
import { DbConnectionManager, MONGOOSE_MODELS } from '../../..';
import { IOutletDoc } from '../../../models/tenantDb/catalogueModels';
import { defaultOutlet } from '../../../seeds';

export class OutletDbService {
    static getModal = (): Model<IOutletDoc> =>
        DbConnectionManager.getTenantModel<IOutletDoc>(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.OUTLET);

    // // holds the fields to fetch when getting or populating the modal
    // static fieldsToFetch: Array<keyof IOutletData> = ['id', 'name', 'address'];
    // // to use in mongoose select()
    // static fieldsToFetchString = OutletDbService.fieldsToFetch.join(' ');

    // to convert to IOutletData
    static convertToIOutletDataFormat = (outletDoc: IOutletDoc): IOutletData => {
        return {
            id: outletDoc._id,
            name: outletDoc.name,
            address: outletDoc.address,
        };
    };

    static seedMainOutlet = async (): Promise<IOutletDoc> => {
        const Outlet = OutletDbService.getModal();
        const mainOutlet = await Outlet.create(defaultOutlet);
        return mainOutlet;
    };

    // create a new outlet
    static createOutlet = async (newOutlet: IOutletData): Promise<IOutletData> => {
        const Outlet = OutletDbService.getModal();
        const doesOutletExists = await Outlet.exists({ name: newOutlet.name });
        if (doesOutletExists) {
            throw new BadRequestError(ERROR_CODE.OUTLET_NAME_INVALID, 'Outlet name already exist');
        }
        const createdOutlet = await Outlet.create(newOutlet);
        return OutletDbService.convertToIOutletDataFormat(createdOutlet);
    };

    // edit an existing outlet
    static editOutlet = async (
        outletId: string,
        outletToUpdate: IOutletData,
    ): Promise<IOutletData> => {
        const Outlet = OutletDbService.getModal();
        const updatedOutletdoc = await Outlet.findByIdAndUpdate(outletId, outletToUpdate, {
            new: true,
        });
        return OutletDbService.convertToIOutletDataFormat(updatedOutletdoc);
    };

    // to search for an outlet
    static searchOutlet = async (query: string): Promise<IOutletData[]> => {
        const Outlet = OutletDbService.getModal();
        const matchingOutlets = await Outlet.find({ name: new RegExp(`^${query}`, 'i') });
        return matchingOutlets.map((outlet) => OutletDbService.convertToIOutletDataFormat(outlet));
    };

    // to get a specific outlet
    static getOutlet = async (outletId: string): Promise<IOutletData> => {
        const Outlet = OutletDbService.getModal();
        const outlet = await Outlet.findById(outletId);
        return OutletDbService.convertToIOutletDataFormat(outlet);
    };

    // get all outlets
    static getAllOutlet = async (): Promise<IOutletData[]> => {
        const Outlet = OutletDbService.getModal();
        const allOutlets = await Outlet.find({});

        // seeding database if requried
        if (!allOutlets) {
            const mainOutlet = await OutletDbService.seedMainOutlet();
            return [OutletDbService.convertToIOutletDataFormat(mainOutlet)];
        }
        return allOutlets as IOutletData[];
    };
    // to delete a specifig outlet
    static deleteOutlet = async (outletId: string): Promise<void> => {
        const Outlet = OutletDbService.getModal();
        await Outlet.deleteOne({ _id: outletId, default: false });
    };
}
