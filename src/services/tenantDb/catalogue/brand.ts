import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { IBrandDoc } from '../../../models/tenantDb/catalogueModels';
import { ERROR_CODE, ICreateBrandRequest, IEditBrandRequest } from '@sellerspot/universal-types';
import { BadRequestError, logger } from '@sellerspot/universal-functions';
import { Model } from 'mongoose';

export class BrandDbService {
    static getModal = (): Model<IBrandDoc> => {
        return DbConnectionManager.getTenantModel<IBrandDoc>(
            MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND,
        );
    };

    static getAllBrand = async (): Promise<IBrandDoc[]> => {
        const Brand = BrandDbService.getModal();
        const allBrands = await Brand.find({});
        return allBrands;
    };

    static createBrand = async (newBrand: ICreateBrandRequest): Promise<IBrandDoc> => {
        const { name } = newBrand;
        const Brand = BrandDbService.getModal();
        const isBrandExist = await Brand.exists({ name });
        if (isBrandExist) {
            throw new BadRequestError(ERROR_CODE.BRAND_NAME_INVALID, 'Brand name already exist');
        }
        const brand = await Brand.create({ name });
        return brand;
    };

    static getBrand = async (brandId: string): Promise<IBrandDoc> => {
        const Brand = BrandDbService.getModal();
        const brand = await Brand.findById(brandId);
        return brand;
    };

    static searchBrand = async (query: string): Promise<IBrandDoc[]> => {
        const Brand = BrandDbService.getModal();
        const matchingBrands = await Brand.find({ name: new RegExp(`^${query}`, 'i') });
        return matchingBrands;
    };

    static editBrand = async (
        brandId: string,
        updatedDoc: IEditBrandRequest,
    ): Promise<IBrandDoc> => {
        const Brand = BrandDbService.getModal();
        const { name } = updatedDoc;
        const brand = await Brand.findByIdAndUpdate(
            brandId,
            { name },
            {
                new: true,
            },
        );
        return brand;
    };

    static deleteBrand = async (brandId: string): Promise<void> => {
        const Brand = BrandDbService.getModal();
        await Brand.deleteOne({ _id: brandId });
    };
}
