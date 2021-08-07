import { BadRequestError } from '@sellerspot/universal-functions';
import {
    ERROR_CODE,
    ICreateTaxBracketRequest,
    ICreateTaxGroupRequest,
    IEditTaxBracketRequest,
    IEditTaxGroupRequest,
} from '@sellerspot/universal-types';
import { Model, PopulateOptions } from 'mongoose';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { ITaxSettingDoc } from '../../../models/tenantDb/catalogueModels';

export class TaxBracketDbService {
    static createTaxBracket = async (
        bracket: ICreateTaxBracketRequest,
    ): Promise<ITaxSettingDoc> => {
        const { name, rate } = bracket;
        const TaxSetting = TaxSettingDbService.getModal();
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

    static getAllTaxBracket = async (): Promise<ITaxSettingDoc[]> => {
        const TaxSetting = TaxSettingDbService.getModal();
        const allTaxBracket = await TaxSetting.find({});
        return allTaxBracket.filter((bracket) => bracket.isGroup === false);
    };

    static getTaxBracket = async (bracketId: string): Promise<ITaxSettingDoc> => {
        const TaxSetting = TaxSettingDbService.getModal();
        const requiredTaxBracket = await TaxSetting.findById(bracketId);
        return requiredTaxBracket;
    };

    static editTaxBracket = async (
        updatedBracket: IEditTaxBracketRequest,
        bracketId: string,
    ): Promise<ITaxSettingDoc> => {
        const TaxSetting = TaxSettingDbService.getModal();
        const newTaxBracket = await TaxSetting.findByIdAndUpdate(bracketId, updatedBracket, {
            new: true,
        });
        return newTaxBracket;
    };

    static deleteTaxBracket = async (bracketId: string): Promise<void> => {
        const TaxSetting = TaxSettingDbService.getModal();
        await TaxSetting.deleteOne({ _id: bracketId });
    };
}

export class TaxGroupDbService {
    static getAllTaxGroup = async (): Promise<ITaxSettingDoc[]> => {
        const TaxSetting = TaxSettingDbService.getModal();
        const allTaxGroup = await TaxSetting.find({}).populate({
            path: 'group',
            select: 'id name rate',
        });
        return allTaxGroup.filter((bracket) => bracket.isGroup === true);
    };

    static getTaxGroup = async (taxGroupId: string): Promise<ITaxSettingDoc> => {
        const TaxSetting = TaxSettingDbService.getModal();
        const taxGroup = await TaxSetting.findOne({ _id: taxGroupId }).populate(
            TaxGroupDbService.getDefaultPopulateOptions(),
        );
        return taxGroup;
    };

    static createTaxGroup = async (group: ICreateTaxGroupRequest): Promise<ITaxSettingDoc> => {
        const { name, bracket } = group;
        const TaxSetting = TaxSettingDbService.getModal();
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
            .populate(TaxGroupDbService.getDefaultPopulateOptions())
            .execPopulate();
        return newTaxGroup;
    };

    static editTaxGroup = async (
        newTaxGroup: IEditTaxGroupRequest,
        taxGroupId: string,
    ): Promise<ITaxSettingDoc> => {
        const { bracket, name } = newTaxGroup;
        const TaxSetting = TaxSettingDbService.getModal();
        const updatedTaxGroup = await TaxSetting.findByIdAndUpdate(
            taxGroupId,
            { name, group: bracket },
            {
                new: true,
            },
        ).populate(TaxGroupDbService.getDefaultPopulateOptions());
        return updatedTaxGroup;
    };

    static deleteTaxGroup = async (taxGroupId: string): Promise<void> => {
        const TaxSetting = TaxSettingDbService.getModal();
        await TaxSetting.deleteOne({ _id: taxGroupId });
    };

    static getDefaultPopulateOptions = (): PopulateOptions[] => {
        const populateArrOpts: PopulateOptions[] = [];
        populateArrOpts.push({ path: 'group', select: 'id name rate' });
        return populateArrOpts;
    };
}

export class TaxSettingDbService {
    static getModal = (): Model<ITaxSettingDoc> => {
        return DbConnectionManager.getTenantModel<ITaxSettingDoc>(
            MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXSETTING,
        );
    };

    static searchTaxSetting = async (
        query: string,
        searchFor: 'bracket' | 'group' | 'all',
    ): Promise<ITaxSettingDoc[]> => {
        const TaxSetting = TaxSettingDbService.getModal();
        const matchedTaxSetting = await TaxSetting.find({
            name: new RegExp(`^${query}`, 'i'),
        }).populate(TaxSettingDbService.getDefaultPopulateOptions());
        switch (searchFor) {
            case 'all':
                return matchedTaxSetting;
            case 'bracket':
                return matchedTaxSetting.filter((setting) => setting.isGroup === false);
            case 'group':
                return matchedTaxSetting.filter((setting) => setting.isGroup === true);
        }
    };

    static getDefaultPopulateOptions = (): PopulateOptions[] => {
        const populateArrOpts: PopulateOptions[] = [];
        populateArrOpts.push({ path: 'group', select: 'id name rate' });
        return populateArrOpts;
    };
}
