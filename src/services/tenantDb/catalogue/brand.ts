import { BadRequestError } from '@sellerspot/universal-functions';
import { ERROR_CODE, IBrandData, ICreateBrandRequest } from '@sellerspot/universal-types';
import { Model } from 'mongoose';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { IBrandDoc } from '../../../models/tenantDb/catalogueModels';

export class BrandDbService {
    static getModal = (): Model<IBrandDoc> =>
        DbConnectionManager.getTenantModel<IBrandDoc>(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND);

    // holds the fields to fetch when getting or populating the modal
    static fieldsToFetch: Array<keyof IBrandData> = ['id', 'name'];
    // to use in mongoose select()
    static fieldsToFetchString = BrandDbService.fieldsToFetch.join(' ');

    // to convert to IBrandData
    static convertToIBrandDataFormat = (brandDoc: IBrandDoc): IBrandData => {
        return {
            id: brandDoc._id,
            name: brandDoc.name,
        };
    };

    // get all brands
    static getAllBrand = async (): Promise<IBrandData[]> => {
        const Brand = BrandDbService.getModal();
        const allBrands = await Brand.find({});
        return allBrands.map((brandData) => BrandDbService.convertToIBrandDataFormat(brandData));
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
        return BrandDbService.convertToIBrandDataFormat(createdBrand);
    };

    // get a specific brand
    static getBrand = async (brandId: string): Promise<IBrandData> => {
        const Brand = BrandDbService.getModal();
        const brand = await Brand.findById(brandId);
        return BrandDbService.convertToIBrandDataFormat(brand);
    };

    // search for brands
    static searchBrand = async (query: string): Promise<IBrandData[]> => {
        const Brand = BrandDbService.getModal();
        const matchingBrands = await Brand.find({ name: new RegExp(`^${query}`, 'i') });
        return matchingBrands.map((brandData) =>
            BrandDbService.convertToIBrandDataFormat(brandData),
        );
    };

    // edit specific brand
    static editBrand = async (
        brandId: string,
        brandDataToUpdate: IBrandData,
    ): Promise<IBrandData> => {
        const Brand = BrandDbService.getModal();
        const updatedBrand = await Brand.findByIdAndUpdate(brandId, brandDataToUpdate, {
            new: true,
        });
        return BrandDbService.convertToIBrandDataFormat(updatedBrand);
    };

    // delete specific brand
    static deleteBrand = async (brandId: string): Promise<void> => {
        const Brand = BrandDbService.getModal();
        await Brand.deleteOne({ _id: brandId });
    };
}
