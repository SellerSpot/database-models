import {
    ERROR_CODE,
    ICreateTaxBracketRequest,
    ICreateTaxGroupRequest,
} from '@sellerspot/universal-types';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { ITaxBracket } from '../../../models/tenantDb/catalogueModels';
import { MONGOOSE_MODELS } from '../../../models';
import { BadRequestError } from '@sellerspot/universal-functions';

export const createTaxBracket = async (bracket: ICreateTaxBracketRequest): Promise<ITaxBracket> => {
    const { name, rate } = bracket;
    const TaxBracket = DbConnectionManager.getTenantModel<ITaxBracket>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET,
    );
    const isBracketExist = await TaxBracket.exists({ name });
    if (isBracketExist) {
        throw new BadRequestError(
            ERROR_CODE.TAX_BRACKET_NAME_INVALID,
            'Tax Bracket with same name already exist',
        );
    }
    const newTaxBracket = await TaxBracket.create({ name, rate });
    return newTaxBracket;
};

export const createTaxGroup = async (group: ICreateTaxGroupRequest): Promise<ITaxBracket> => {
    const { name, bracket } = group;
    const TaxBracket = DbConnectionManager.getTenantModel<ITaxBracket>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET,
    );
    const matchedCount = await TaxBracket.countDocuments({ _id: { $in: bracket } });
    if (matchedCount !== bracket.length) {
        throw new BadRequestError(ERROR_CODE.TAX_GROUP_INVALID_BRACKET, 'Invalid Tax Bracket');
    }
    const isGroupExist = await TaxBracket.exists({ name });
    if (isGroupExist) {
        throw new BadRequestError(
            ERROR_CODE.TAX_BRACKET_NAME_INVALID,
            'Tax Group with same name already exist',
        );
    }
    const newTaxGroup = await TaxBracket.create({ name, group: bracket });
    return newTaxGroup;
};

export const getTaxBrackets = async (): Promise<ITaxBracket[]> => {
    const TaxBracket = DbConnectionManager.getTenantModel<ITaxBracket>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET,
    );
    const allTaxBracket = await TaxBracket.find({});
    return allTaxBracket;
};
