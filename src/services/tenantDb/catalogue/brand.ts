import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { IBrandDoc } from '../../../models/tenantDb/catalogueModels';
import { ERROR_CODE, ICreateBrandRequest, IEditBrandRequest } from '@sellerspot/universal-types';
import { BadRequestError, logger } from '@sellerspot/universal-functions';

export const createBrand = async (newBrand: ICreateBrandRequest): Promise<IBrandDoc> => {
    const { name } = newBrand;
    const Brand = DbConnectionManager.getTenantModel<IBrandDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND,
    );
    const isBrandExist = await Brand.exists({ name });
    if (isBrandExist) {
        throw new BadRequestError(ERROR_CODE.BRAND_NAME_INVALID, 'Brand name already exist');
    }
    const brand = await Brand.create({ name });
    return brand;
};

export const getAllBrand = async (): Promise<IBrandDoc[]> => {
    const Brand = DbConnectionManager.getTenantModel<IBrandDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND,
    );
    const allBrands = await Brand.find({});
    return allBrands;
};

export const getBrand = async (brandId: string): Promise<IBrandDoc> => {
    const Brand = DbConnectionManager.getTenantModel<IBrandDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND,
    );
    const brand = await Brand.findById(brandId);
    return brand;
};

export const searchBrand = async (query: string): Promise<IBrandDoc[]> => {
    const Brand = DbConnectionManager.getTenantModel<IBrandDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND,
    );
    const matchingBrands = await Brand.find({ name: new RegExp(`^${query}`, 'i') });
    return matchingBrands;
};

export const editBrand = async (
    brandId: string,
    updatedDoc: IEditBrandRequest,
): Promise<IBrandDoc> => {
    const Brand = DbConnectionManager.getTenantModel<IBrandDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND,
    );
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

export const deleteBrand = async (brandId: string): Promise<void> => {
    const Brand = DbConnectionManager.getTenantModel<IBrandDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND,
    );
    await Brand.deleteOne({ _id: brandId });
};
