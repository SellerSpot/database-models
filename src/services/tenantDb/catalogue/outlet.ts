import { BadRequestError } from '@sellerspot/universal-functions';
import { ERROR_CODE, IOutletData } from '@sellerspot/universal-types';
import { pick } from 'lodash';
import { Model } from 'mongoose';
import { DbConnectionManager, MONGOOSE_MODELS } from '../../..';
import { IOutletDoc } from '../../../models/tenantDb/catalogueModels';
import { defaultOutlet } from '../../../seeds';

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

    static seedMainOutlet = async (): Promise<IOutletData> => {
        const Outlet = OutletDbService.getModal();
        const mainOutlet = await Outlet.create(defaultOutlet);
        return mainOutlet as IOutletData;
    };

    // create a new outlet
    static createOutlet = async (newOutlet: IOutletData): Promise<IOutletData> => {
        const Outlet = OutletDbService.getModal();
        const doesOutletExists = await Outlet.exists({ name: newOutlet.name });
        if (doesOutletExists) {
            throw new BadRequestError(ERROR_CODE.OUTLET_NAME_INVALID, 'Brand name already exist');
        }
        const createdOutlet = await Outlet.create(newOutlet);
        return pick(createdOutlet, OutletDbService.fieldsToFetch) as IOutletData;
    };

    // edit an existing outlet
    static editOutlet = async (
        outletId: string,
        updatedOutlet: IOutletData,
    ): Promise<IOutletData> => {
        const Outlet = OutletDbService.getModal();
        const updatedOutletdoc = await Outlet.findByIdAndUpdate(
            outletId,
            {
                name: updatedOutlet.name,
                address: updatedOutlet.address,
            },
            {
                new: true,
            },
        ).select(OutletDbService.fieldsToFetchString);
        return updatedOutletdoc as IOutletData;
    };

    // to search for an outlet
    static searchOutlet = async (query: string): Promise<IOutletData[]> => {
        const Outlet = OutletDbService.getModal();
        const matchingOutlets = await Outlet.find({ name: new RegExp(`^${query}`, 'i') }).select(
            OutletDbService.fieldsToFetchString,
        );
        return matchingOutlets as IOutletData[];
    };

    // to delete a specifig outlet
    static deleteOutlet = async (outletId: string): Promise<void> => {
        const Outlet = OutletDbService.getModal();
        await Outlet.deleteOne({ _id: outletId });
    };

    // to get a specific outlet
    static getOutlet = async (outletId: string): Promise<IOutletData> => {
        const Outlet = OutletDbService.getModal();
        const outlet = await Outlet.findById(outletId).select(OutletDbService.fieldsToFetchString);
        return outlet as IOutletData;
    };

    // get all outlets
    static getAllOutlet = async (): Promise<IOutletData[]> => {
        const Outlet = OutletDbService.getModal();
        let allOutlets = (await Outlet.find({}).select(
            OutletDbService.fieldsToFetchString,
        )) as IOutletData[];

        // seeding database if requried
        if (!allOutlets) {
            const mainOutlet = await OutletDbService.seedMainOutlet();
            allOutlets = [mainOutlet];
        }
        return allOutlets as IOutletData[];
    };
}
