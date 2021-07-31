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
import { ITaxSettingDoc } from '../../../models/tenantDb/catalogueModels';

// tax bracket
export const createTaxBracket = async (
    bracket: ICreateTaxBracketRequest,
): Promise<ITaxSettingDoc> => {
    const { name, rate } = bracket;
    const TaxSetting = DbConnectionManager.getTenantModel<ITaxSettingDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXSETTING,
    );
    const isBracketExist = await TaxSetting.exists({ name });
    if (isBracketExist) {
        throw new BadRequestError(
            ERROR_CODE.TAX_BRACKET_NAME_INVALID,
            'Tax Bracket with same name already exist',
        );
    }
    const newTaxBracket = await TaxSetting.create({ name, rate });
    return newTaxBracket;
};

export const getAllTaxBracket = async (): Promise<ITaxSettingDoc[]> => {
    const TaxSetting = DbConnectionManager.getTenantModel<ITaxSettingDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXSETTING,
    );
    const allTaxBracket = await TaxSetting.find({});
    return allTaxBracket.filter((bracket) => bracket.isGroup === false);
};

export const getTaxBracket = async (bracketId: string): Promise<ITaxSettingDoc> => {
    const TaxSetting = DbConnectionManager.getTenantModel<ITaxSettingDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXSETTING,
    );
    const requiredTaxBracket = await TaxSetting.findById(bracketId);
    return requiredTaxBracket;
};

export const editTaxBracket = async (
    updatedBracket: IEditTaxBracketRequest,
    bracketId: string,
): Promise<ITaxSettingDoc> => {
    const TaxSetting = DbConnectionManager.getTenantModel<ITaxSettingDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXSETTING,
    );
    const newTaxBracket = await TaxSetting.findByIdAndUpdate(bracketId, updatedBracket, {
        new: true,
    });
    return newTaxBracket;
};

export const deleteTaxBracket = async (bracketId: string): Promise<void> => {
    const TaxSetting = DbConnectionManager.getTenantModel<ITaxSettingDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXSETTING,
    );
    await TaxSetting.deleteOne({ _id: bracketId });
};

// tax group
export const getAllTaxGroup = async (): Promise<ITaxSettingDoc[]> => {
    const TaxSetting = DbConnectionManager.getTenantModel<ITaxSettingDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXSETTING,
    );
    const allTaxGroup = await TaxSetting.find({}).populate({
        path: 'group',
        select: 'id name rate',
    });
    return allTaxGroup.filter((bracket) => bracket.isGroup === true);
};

export const getTaxGroup = async (taxGroupId: string): Promise<ITaxSettingDoc> => {
    const TaxSetting = DbConnectionManager.getTenantModel<ITaxSettingDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXSETTING,
    );
    const taxGroup = await TaxSetting.findOne({ _id: taxGroupId }).populate({
        path: 'group',
        select: 'id name rate',
    });
    return taxGroup;
};

export const createTaxGroup = async (group: ICreateTaxGroupRequest): Promise<ITaxSettingDoc> => {
    const { name, bracket } = group;
    const TaxSetting = DbConnectionManager.getTenantModel<ITaxSettingDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXSETTING,
    );
    const matchedCount = await TaxSetting.countDocuments({ _id: { $in: bracket } });
    if (matchedCount !== bracket.length) {
        throw new BadRequestError(ERROR_CODE.TAX_GROUP_INVALID_BRACKET, 'Invalid Tax Bracket');
    }
    const isGroupExist = await TaxSetting.exists({ name });
    if (isGroupExist) {
        throw new BadRequestError(
            ERROR_CODE.TAX_BRACKET_NAME_INVALID,
            'Tax Group with same name already exist',
        );
    }
    let newTaxGroup = await TaxSetting.create({ name, group: bracket });
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
): Promise<ITaxSettingDoc> => {
    const { bracket, name } = newTaxGroup;
    const TaxSetting = DbConnectionManager.getTenantModel<ITaxSettingDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXSETTING,
    );
    const updatedTaxGroup = await TaxSetting.findByIdAndUpdate(
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

export const searchTaxSetting = async (
    query: string,
    searchFor: 'bracket' | 'group' | 'all',
): Promise<ITaxSettingDoc[]> => {
    const TaxSetting = DbConnectionManager.getTenantModel<ITaxSettingDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXSETTING,
    );
    const matchedTaxSetting = await TaxSetting.find({
        name: new RegExp(`^${query}`, 'i'),
    }).populate({
        path: 'group',
        select: 'id name rate',
    });
    switch (searchFor) {
        case 'all':
            return matchedTaxSetting;
        case 'bracket':
            return matchedTaxSetting.filter((setting) => setting.isGroup === false);
        case 'group':
            return matchedTaxSetting.filter((setting) => setting.isGroup === true);
    }
};

export const deleteTaxGroup = async (taxGroupId: string): Promise<void> => {
    const TaxSetting = DbConnectionManager.getTenantModel<ITaxSettingDoc>(
        MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXSETTING,
    );
    await TaxSetting.deleteOne({ _id: taxGroupId });
};
