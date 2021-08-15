import { Model } from 'mongoose';
import { BadRequestError, logger } from '@sellerspot/universal-functions';
import { ERROR_CODE, IOutletData } from '@sellerspot/universal-types';
import { IOutletDoc } from '../../../models/tenantDb/catalogueModels';
import { defaultOutlet } from '../../../seeds';
import { DbConnectionManager, MONGOOSE_MODELS } from '../../..';

export class OutletService {
    static getModal = (): Model<IOutletDoc> =>
        DbConnectionManager.getTenantModel<IOutletDoc>(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.OUTLET);

    // holds the fields to fetch when getting or populating the modal
    static fieldsToFetch: Array<keyof IOutletData> = ['id', 'name', 'address'];
    // to use in mongoose select()
    static fieldsToFetchString = OutletService.fieldsToFetch.join(' ');

    // to convert to IOutletData
    static convertToIOutletDataFormat = (outletDoc: IOutletDoc): IOutletData => {
        return {
            id: outletDoc._id,
            name: outletDoc.name,
            address: outletDoc.address,
        };
    };

    static seedMainOutlet = async (): Promise<IOutletDoc> => {
        const Outlet = OutletService.getModal();
        const mainOutlet = await Outlet.create(defaultOutlet);
        logger.info('Outlets seeded successfully');
        return mainOutlet;
    };

    // create a new outlet
    static createOutlet = async (newOutlet: IOutletData): Promise<IOutletData> => {
        const Outlet = OutletService.getModal();
        const doesOutletExists = await Outlet.exists({ name: newOutlet.name });
        if (doesOutletExists) {
            throw new BadRequestError(ERROR_CODE.OUTLET_NAME_INVALID, 'Outlet name already exist');
        }
        const createdOutlet = await Outlet.create(newOutlet);
        return OutletService.convertToIOutletDataFormat(createdOutlet);
    };

    // edit an existing outlet
    static editOutlet = async (
        outletId: string,
        outletToUpdate: IOutletData,
    ): Promise<IOutletData> => {
        const Outlet = OutletService.getModal();
        const updatedOutletdoc = await Outlet.findByIdAndUpdate(outletId, outletToUpdate, {
            new: true,
        });
        return OutletService.convertToIOutletDataFormat(updatedOutletdoc);
    };

    // to search for an outlet
    static searchOutlet = async (query: string): Promise<IOutletData[]> => {
        const Outlet = OutletService.getModal();
        const matchingOutlets = await Outlet.find({ name: new RegExp(`^${query}`, 'i') });
        return matchingOutlets.map((outlet) => OutletService.convertToIOutletDataFormat(outlet));
    };

    // to get a specific outlet
    static getOutlet = async (outletId: string): Promise<IOutletData> => {
        const Outlet = OutletService.getModal();
        const outlet = await Outlet.findById(outletId);
        return OutletService.convertToIOutletDataFormat(outlet);
    };

    // get all outlets
    static getAllOutlet = async (): Promise<IOutletData[]> => {
        const Outlet = OutletService.getModal();
        const allOutlets = await Outlet.find({});

        // seeding database if requried
        if (!allOutlets) {
            const mainOutlet = await OutletService.seedMainOutlet();
            return [OutletService.convertToIOutletDataFormat(mainOutlet)];
        }
        return allOutlets.map((outlet) => OutletService.convertToIOutletDataFormat(outlet));
    };
    // to delete a specifig outlet
    static deleteOutlet = async (outletId: string): Promise<void> => {
        const Outlet = OutletService.getModal();
        await Outlet.deleteOne({ _id: outletId, default: false });
    };
}
