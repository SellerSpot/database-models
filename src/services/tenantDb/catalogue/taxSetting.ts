import { BadRequestError } from '@sellerspot/universal-functions';
import {
    ERROR_CODE,
    ICreateTaxBracketRequest,
    ICreateTaxGroupRequest,
    IEditTaxBracketRequest,
    IEditTaxGroupRequest,
    ITaxBracketData,
    ITaxGroupData,
    ITaxSettingData,
} from '@sellerspot/universal-types';
import { pick } from 'lodash';
import { Model, PopulateOptions } from 'mongoose';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { ITaxSettingDoc } from '../../../models/tenantDb/catalogueModels';

export class TaxBracketDbService {
    // holds the fields to fetch when getting or populating the modal
    static fieldsToFetch: Array<keyof ITaxBracketData> = ['id', 'name', 'rate'];
    // to use in mongoose select()
    static fieldsToFetchString = TaxBracketDbService.fieldsToFetch.join(' ');

    static createTaxBracket = async (
        bracket: ICreateTaxBracketRequest,
    ): Promise<ITaxBracketData> => {
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
        return pick(newTaxBracket, TaxBracketDbService.fieldsToFetch) as ITaxBracketData;
    };

    static getAllTaxBracket = async (): Promise<ITaxBracketData[]> => {
        const TaxSetting = TaxSettingDbService.getModal();
        const allTaxBracket = await TaxSetting.find({}).select(
            TaxBracketDbService.fieldsToFetchString,
        );
        return allTaxBracket.filter((bracket) => bracket.isGroup === false) as ITaxBracketData[];
    };

    static getTaxBracket = async (bracketId: string): Promise<ITaxSettingDoc> => {
        const TaxSetting = TaxSettingDbService.getModal();
        const requiredTaxBracket = await TaxSetting.findById(bracketId).select(
            TaxBracketDbService.fieldsToFetchString,
        );
        return requiredTaxBracket;
    };

    static editTaxBracket = async (
        updatedBracket: IEditTaxBracketRequest,
        bracketId: string,
    ): Promise<ITaxSettingDoc> => {
        const TaxSetting = TaxSettingDbService.getModal();
        const newTaxBracket = await TaxSetting.findByIdAndUpdate(bracketId, updatedBracket, {
            new: true,
        }).select(TaxBracketDbService.fieldsToFetchString);
        return newTaxBracket;
    };

    static deleteTaxBracket = async (bracketId: string): Promise<void> => {
        const TaxSetting = TaxSettingDbService.getModal();
        await TaxSetting.deleteOne({ _id: bracketId });
    };
}

export class TaxGroupDbService {
    // holds the fields to fetch when getting or populating the modal
    static fieldsToFetch: Array<keyof ITaxGroupData> = ['id', 'name', 'bracket'];
    // to use in mongoose select()
    static fieldsToFetchString = TaxGroupDbService.fieldsToFetch.join(' ');

    static getDefaultPopulateOptions = (): PopulateOptions[] => {
        const populateArrOpts: PopulateOptions[] = [];
        populateArrOpts.push({ path: 'bracket', select: TaxBracketDbService.fieldsToFetchString });
        return populateArrOpts;
    };

    static getAllTaxGroup = async (): Promise<ITaxGroupData[]> => {
        const TaxSetting = TaxSettingDbService.getModal();
        const allTaxGroup = await TaxSetting.find({})
            .select(TaxGroupDbService.fieldsToFetchString)
            .populate(TaxGroupDbService.getDefaultPopulateOptions());
        return allTaxGroup.filter((bracket) => bracket.isGroup === true) as ITaxGroupData[];
    };

    static getTaxGroup = async (taxGroupId: string): Promise<ITaxGroupData> => {
        const TaxSetting = TaxSettingDbService.getModal();
        const taxGroup = await TaxSetting.findOne({ _id: taxGroupId })
            .select(TaxGroupDbService.fieldsToFetchString)
            .populate(TaxGroupDbService.getDefaultPopulateOptions());
        return taxGroup as ITaxGroupData;
    };

    static createTaxGroup = async (group: ICreateTaxGroupRequest): Promise<ITaxGroupData> => {
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
        let newTaxGroup = await TaxSetting.create({ name, bracket });
        newTaxGroup = await newTaxGroup
            .populate(TaxGroupDbService.getDefaultPopulateOptions())
            .execPopulate();
        return pick(newTaxGroup, TaxGroupDbService.fieldsToFetch) as ITaxGroupData;
    };

    static editTaxGroup = async (
        newTaxGroup: IEditTaxGroupRequest,
        taxGroupId: string,
    ): Promise<ITaxGroupData> => {
        const { bracket, name } = newTaxGroup;
        const TaxSetting = TaxSettingDbService.getModal();
        const updatedTaxGroup = await TaxSetting.findByIdAndUpdate(
            taxGroupId,
            { name, group: bracket },
            {
                new: true,
            },
        )
            .select(TaxGroupDbService.fieldsToFetchString)
            .populate(TaxGroupDbService.getDefaultPopulateOptions());
        return updatedTaxGroup as ITaxGroupData;
    };

    static deleteTaxGroup = async (taxGroupId: string): Promise<void> => {
        const TaxSetting = TaxSettingDbService.getModal();
        await TaxSetting.deleteOne({ _id: taxGroupId });
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
    ): Promise<ITaxSettingData[]> => {
        const TaxSetting = TaxSettingDbService.getModal();
        let selectOptions = '';
        switch (searchFor) {
            case 'bracket':
                selectOptions = TaxBracketDbService.fieldsToFetchString;
                break;
            case 'group':
                selectOptions = TaxGroupDbService.fieldsToFetchString;
                break;
        }
        const matchedTaxSetting = await TaxSetting.find({
            name: new RegExp(`^${query}`, 'i'),
        })
            .populate(TaxSettingDbService.getDefaultPopulateOptions())
            .select(selectOptions);
        switch (searchFor) {
            case 'all':
                return matchedTaxSetting as ITaxSettingData[];
            case 'bracket':
                return matchedTaxSetting.filter(
                    (setting) => setting.isGroup === false,
                ) as ITaxBracketData[];
            case 'group':
                return matchedTaxSetting.filter(
                    (setting) => setting.isGroup === true,
                ) as ITaxGroupData[];
        }
    };

    static getDefaultPopulateOptions = (): PopulateOptions[] => {
        const populateArrOpts: PopulateOptions[] = [];
        populateArrOpts.push({ path: 'bracket', select: TaxBracketDbService.fieldsToFetchString });
        return populateArrOpts;
    };
}
