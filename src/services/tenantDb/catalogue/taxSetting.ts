import { BadRequestError } from '@sellerspot/universal-functions';
import {
    ERROR_CODE,
    ICreateTaxBracketRequest,
    ICreateTaxGroupRequest,
    IEditTaxBracketRequest,
    IEditTaxGroupRequest,
} from '@sellerspot/universal-types';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { ITaxBracketDoc } from '../../../models/tenantDb/catalogueModels';

// tax bracket
export const createTaxBracket = async (
    bracket: ICreateTaxBracketRequest,
): Promise<ITaxBracketDoc> => {
    const { name, rate } = bracket;
    const TaxBracket = DbConnectionManager.getTenantModel<ITaxBracketDoc>(
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

export const getAllTaxBracket = async (): Promise<ITaxBracketDoc[]> => {
    const TaxBracket = DbConnectionManager.getTenantModel<ITaxBracketDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET,
    );
    const allTaxBracket = await TaxBracket.find({});
    return allTaxBracket.filter((bracket) => bracket.isGroup === false);
};

export const getTaxBracket = async (bracketId: string): Promise<ITaxBracketDoc> => {
    const TaxBracket = DbConnectionManager.getTenantModel<ITaxBracketDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET,
    );
    const requiredTaxBracket = await TaxBracket.findById(bracketId);
    return requiredTaxBracket;
};

export const editTaxBracket = async (
    updatedBracket: IEditTaxBracketRequest,
    bracketId: string,
): Promise<ITaxBracketDoc> => {
    const TaxBracket = DbConnectionManager.getTenantModel<ITaxBracketDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET,
    );
    const newTaxBracket = await TaxBracket.findByIdAndUpdate(bracketId, updatedBracket, {
        new: true,
    });
    return newTaxBracket;
};

export const deleteTaxBracket = async (bracketId: string): Promise<void> => {
    const TaxBracket = DbConnectionManager.getTenantModel<ITaxBracketDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET,
    );
    await TaxBracket.deleteOne({ _id: bracketId });
};

// tax group
export const getAllTaxGroup = async (): Promise<ITaxBracketDoc[]> => {
    const TaxBracket = DbConnectionManager.getTenantModel<ITaxBracketDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET,
    );
    const allTaxBracket = await TaxBracket.find({}).populate({
        path: 'group',
        select: 'id name rate',
    });
    return allTaxBracket.filter((bracket) => bracket.isGroup === true);
};

export const getTaxGroup = async (taxGroupId: string): Promise<ITaxBracketDoc> => {
    const TaxBracket = DbConnectionManager.getTenantModel<ITaxBracketDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET,
    );
    const taxGroup = await TaxBracket.findOne({ _id: taxGroupId }).populate({
        path: 'group',
        select: 'id name rate',
    });
    return taxGroup;
};

export const createTaxGroup = async (group: ICreateTaxGroupRequest): Promise<ITaxBracketDoc> => {
    const { name, bracket } = group;
    const TaxBracket = DbConnectionManager.getTenantModel<ITaxBracketDoc>(
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
    let newTaxGroup = await TaxBracket.create({ name, group: bracket });
    newTaxGroup = await newTaxGroup
        .populate({
            path: 'group',
            select: 'id name rate',
        })
        .execPopulate();
    return newTaxGroup;
};

export const editTaxGroup = async (
    newTaxGroup: IEditTaxGroupRequest,
    taxGroupId: string,
): Promise<ITaxBracketDoc> => {
    const { bracket, name } = newTaxGroup;
    const TaxBracket = DbConnectionManager.getTenantModel<ITaxBracketDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET,
    );
    const updatedTaxGroup = await TaxBracket.findByIdAndUpdate(
        taxGroupId,
        { name, group: bracket },
        {
            new: true,
        },
    ).populate({
        path: 'group',
        select: 'id name rate',
    });
    return updatedTaxGroup;
};

export const deleteTaxGroup = async (taxGroupId: string): Promise<void> => {
    const TaxBracket = DbConnectionManager.getTenantModel<ITaxBracketDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET,
    );
    await TaxBracket.deleteOne({ _id: taxGroupId });
};
