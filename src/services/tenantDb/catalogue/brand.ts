import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { IBrand } from '../../../models/tenantDb/catalogueModels';
import { ERROR_CODE, ICreateBrandRequest } from '@sellerspot/universal-types';
import { BadRequestError } from '@sellerspot/universal-functions';

export const createBrand = async (newBrand: ICreateBrandRequest): Promise<IBrand> => {
    const { name } = newBrand;
    const Brand = DbConnectionManager.getTenantModel<IBrand>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND,
    );
    const isBrandExist = await Brand.exists({ name });
    if (!isBrandExist) {
        const brand = await Brand.create({ name });
        return brand;
    } else {
        throw new BadRequestError(ERROR_CODE.BRAND_NAME_INVALID, 'Brand name already exist');
    }
};

export const getAllBrand = async (): Promise<IBrand[]> => {
    const Brand = DbConnectionManager.getTenantModel<IBrand>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.BRAND,
    );
    const allBrands = await Brand.find({});
    return allBrands;
};
