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

    // to convert to ITaxBracketData
    static convertToITaxBracketDataFormat = (taxSettingDoc: ITaxSettingDoc): ITaxBracketData => {
        return {
            id: taxSettingDoc._id,
            name: taxSettingDoc.name,
            rate: taxSettingDoc.rate,
        };
    };

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
        return TaxBracketDbService.convertToITaxBracketDataFormat(newTaxBracket);
    };

    static getAllTaxBracket = async (): Promise<ITaxBracketData[]> => {
        const TaxSetting = TaxSettingDbService.getModal();
        const allTaxBracket = await TaxSetting.find({});
        const onlyTaxBrackets = allTaxBracket.filter((bracket) => bracket.isGroup === false);
        return onlyTaxBrackets.map((taxBracket) =>
            TaxBracketDbService.convertToITaxBracketDataFormat(taxBracket),
        );
    };

    static getTaxBracket = async (bracketId: string): Promise<ITaxBracketData> => {
        const TaxSetting = TaxSettingDbService.getModal();
        const requiredTaxBracket = await TaxSetting.findById(bracketId);
        return TaxBracketDbService.convertToITaxBracketDataFormat(requiredTaxBracket);
    };

    static editTaxBracket = async (
        taxBracketToUpdate: IEditTaxBracketRequest,
        bracketId: string,
    ): Promise<ITaxBracketData> => {
        const TaxSetting = TaxSettingDbService.getModal();
        const updatedTaxBracket = await TaxSetting.findByIdAndUpdate(
            bracketId,
            taxBracketToUpdate,
            {
                new: true,
            },
        );
        return TaxBracketDbService.convertToITaxBracketDataFormat(updatedTaxBracket);
    };

    static deleteTaxBracket = async (bracketId: string): Promise<void> => {
        const TaxSetting = TaxSettingDbService.getModal();
        await TaxSetting.deleteOne({ _id: bracketId });
    };
}

export class TaxGroupDbService {
    // // holds the fields to fetch when getting or populating the modal
    // static fieldsToFetch: Array<keyof ITaxGroupData> = ['id', 'name', 'bracket'];
    // // to use in mongoose select()
    // static fieldsToFetchString = TaxGroupDbService.fieldsToFetch.join(' ');

    static getDefaultPopulateOptions = (): PopulateOptions[] => {
        const populateArrOpts: PopulateOptions[] = [];
        populateArrOpts.push({ path: 'bracket', select: TaxBracketDbService.fieldsToFetchString });
        return populateArrOpts;
    };

    // to convert to ITaxGroupData
    static convertToITaxGroupDataFormat = (taxSettingDoc: ITaxSettingDoc): ITaxGroupData => {
        return {
            id: taxSettingDoc._id,
            name: taxSettingDoc.name,
            bracket: taxSettingDoc.bracket,
        };
    };

    static getAllTaxGroup = async (): Promise<ITaxGroupData[]> => {
        const TaxSetting = TaxSettingDbService.getModal();
        const allTaxGroup = await TaxSetting.find({}).populate(
            TaxGroupDbService.getDefaultPopulateOptions(),
        );
        const onlyTaxGroups = allTaxGroup.filter((bracket) => bracket.isGroup === true);
        return onlyTaxGroups.map((taxGroup) =>
            TaxGroupDbService.convertToITaxGroupDataFormat(taxGroup),
        );
    };

    static getTaxGroup = async (taxGroupId: string): Promise<ITaxGroupData> => {
        const TaxSetting = TaxSettingDbService.getModal();
        const taxGroup = await TaxSetting.findOne({ _id: taxGroupId }).populate(
            TaxGroupDbService.getDefaultPopulateOptions(),
        );
        return TaxGroupDbService.convertToITaxGroupDataFormat(taxGroup);
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
        return TaxGroupDbService.convertToITaxGroupDataFormat(newTaxGroup);
    };

    static editTaxGroup = async (
        taxGroupToUpdate: IEditTaxGroupRequest,
        taxGroupId: string,
    ): Promise<ITaxGroupData> => {
        const TaxSetting = TaxSettingDbService.getModal();
        const updatedTaxGroup = await TaxSetting.findByIdAndUpdate(taxGroupId, taxGroupToUpdate, {
            new: true,
        }).populate(TaxGroupDbService.getDefaultPopulateOptions());
        return TaxGroupDbService.convertToITaxGroupDataFormat(updatedTaxGroup);
    };

    static deleteTaxGroup = async (taxGroupId: string): Promise<void> => {
        const TaxSetting = TaxSettingDbService.getModal();
        await TaxSetting.deleteOne({ _id: taxGroupId });
    };
}

export class TaxSettingDbService {
    static getModal = (): Model<ITaxSettingDoc> =>
        DbConnectionManager.getTenantModel<ITaxSettingDoc>(
            MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXSETTING,
        );

    // holds the fields to fetch when getting or populating the modal
    static fieldsToFetch: Array<keyof ITaxSettingDoc> = ['id', 'name', 'bracket', 'rate'];
    // to use in mongoose select()
    static fieldsToFetchString = TaxSettingDbService.fieldsToFetch.join(' ');

    // to convert to ITaxSettingData
    static convertToITaxSettingDataFormat = (taxSettingDoc: ITaxSettingDoc): ITaxSettingData => {
        return {
            id: taxSettingDoc._id,
            name: taxSettingDoc.name,
            rate: taxSettingDoc.rate,
            bracket: taxSettingDoc.bracket,
        };
    };

    static getDefaultPopulateOptions = (): PopulateOptions[] => {
        const populateArrOpts: PopulateOptions[] = [];
        populateArrOpts.push({ path: 'bracket', select: TaxBracketDbService.fieldsToFetchString });
        return populateArrOpts;
    };

    static searchTaxSetting = async (
        query: string,
        searchFor: 'bracket' | 'group' | 'all',
    ): Promise<ITaxSettingData[]> => {
        const TaxSetting = TaxSettingDbService.getModal();
        const matchedTaxSetting = await TaxSetting.find({
            name: new RegExp(`^${query}`, 'i'),
        }).populate(TaxSettingDbService.getDefaultPopulateOptions());
        switch (searchFor) {
            case 'all':
                return matchedTaxSetting.map((taxSetting) =>
                    TaxSettingDbService.convertToITaxSettingDataFormat(taxSetting),
                );
            case 'bracket':
                const allBrackets = matchedTaxSetting.filter(
                    (setting) => setting.isGroup === false,
                );
                return allBrackets.map((bracket) =>
                    TaxBracketDbService.convertToITaxBracketDataFormat(bracket),
                );
            case 'group':
                const allGroups = matchedTaxSetting.filter((setting) => setting.isGroup === true);
                return allGroups.map((taxGroup) =>
                    TaxGroupDbService.convertToITaxGroupDataFormat(taxGroup),
                );
        }
    };
}
