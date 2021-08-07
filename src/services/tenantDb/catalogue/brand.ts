import { BadRequestError } from '@sellerspot/universal-functions';
import {
    ERROR_CODE,
    IBrandData,
    ICreateBrandRequest,
    IEditBrandRequest,
} from '@sellerspot/universal-types';
import { pick } from 'lodash';
import { Model } from 'mongoose';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { IBrandDoc } from '../../../models/tenantDb/catalogueModels';

export class BrandDbService {
    static getModal = (): Model<IBrandDoc> => {
        return DbConnectionManager.getTenantModel<IBrandDoc>(
            MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND,
        );
    };

    // holds the fields to fetch when getting or populating the modal
    static fieldsToFetch: Array<keyof IBrandData> = ['id', 'name'];

    // get all brands
    static getAllBrand = async (): Promise<IBrandData[]> => {
        const Brand = BrandDbService.getModal();
        const allBrands = await Brand.find({}).select(BrandDbService.fieldsToFetch.join(' '));
        return allBrands as IBrandData[];
    };

    // create a new brand
    static createBrand = async (newBrand: ICreateBrandRequest): Promise<IBrandData> => {
        const { name } = newBrand;
        const Brand = BrandDbService.getModal();
        const isBrandExist = await Brand.exists({ name });
        if (isBrandExist) {
            throw new BadRequestError(ERROR_CODE.BRAND_NAME_INVALID, 'Brand name already exist');
        }
        const createdBrand = await Brand.create({ name });
        return pick(createdBrand, BrandDbService.fieldsToFetch) as IBrandData;
    };

    // get a specific brand
    static getBrand = async (brandId: string): Promise<IBrandData> => {
        const Brand = BrandDbService.getModal();
        const brand = await Brand.findById(brandId).select(BrandDbService.fieldsToFetch.join(' '));
        return brand as IBrandData;
    };

    // search for brands
    static searchBrand = async (query: string): Promise<IBrandData[]> => {
        const Brand = BrandDbService.getModal();
        const matchingBrands = await Brand.find({ name: new RegExp(`^${query}`, 'i') }).select(
            BrandDbService.fieldsToFetch.join(' '),
        );
        return matchingBrands as IBrandData[];
    };

    // edit specific brand
    static editBrand = async (
        brandId: string,
        updatedDoc: IEditBrandRequest,
    ): Promise<IBrandData> => {
        const Brand = BrandDbService.getModal();
        const { name } = updatedDoc;
        const brand = await Brand.findByIdAndUpdate(
            brandId,
            { name },
            {
                new: true,
            },
        ).select(BrandDbService.fieldsToFetch.join(' '));
        return brand as IBrandData;
    };

    // delete specific brand
    static deleteBrand = async (brandId: string): Promise<void> => {
        const Brand = BrandDbService.getModal();
        await Brand.deleteOne({ _id: brandId });
    };
}
