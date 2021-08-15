import { BadRequestError, logger } from '@sellerspot/universal-functions';
import { ERROR_CODE, ITaxBracketData } from '@sellerspot/universal-types';
import { Model, PopulateOptions, _FilterQuery } from 'mongoose';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { ITaxBracketDoc } from '../../../models/tenantDb/catalogueModels';

export class TaxBracketService {
    static getModal = (): Model<ITaxBracketDoc> =>
        DbConnectionManager.getTenantModel<ITaxBracketDoc>(
            MONGOOSE_MODELS.TENANT_DB.CATALOGUE.TAXBRACKET,
        );

    // holds the fields to fetch when getting or populating the modal
    private static getFieldsToFetch = (): (keyof ITaxBracketData)[] => ['id', 'name', 'rate'];
    // to use in mongoose select()
    private static getFieldsToFetchString = () => TaxBracketService.getFieldsToFetch().join(' ');

    static getTaxGroupPopulateOptions = (): PopulateOptions[] => {
        const populateArrOpts: PopulateOptions[] = [];
        populateArrOpts.push({ path: 'group', select: TaxBracketService.getFieldsToFetchString() });
        return populateArrOpts;
    };

    // to convert to ITaxBracketData with group populated
    static convertToITaxBracketDataFormat = (taxBracketDoc: ITaxBracketDoc): ITaxBracketData => {
        return {
            id: taxBracketDoc._id,
            name: taxBracketDoc.name,
            rate: taxBracketDoc.rate,
        };
    };

    // to convert to ITaxBracketData without group populated
    static convertToITaxGroupDataFormat = (taxBracketDoc: ITaxBracketDoc): ITaxBracketData => {
        const totalGroupRate = (<ITaxBracketData[]>taxBracketDoc.group).reduce(
            (acc, curr) => acc + curr.rate,
            0,
        );
        return {
            id: taxBracketDoc._id,
            name: taxBracketDoc.name,
            rate: totalGroupRate,
            group: taxBracketDoc.group,
        };
    };

    // tax bracet only block
    static createTaxBracket = async (
        payload: Pick<ITaxBracketData, 'name' | 'rate'>,
    ): Promise<ITaxBracketData> => {
        const { name, rate } = payload;
        const TaxBracket = TaxBracketService.getModal();
        const isBracketExist = await TaxBracket.exists({ name });
        if (isBracketExist) {
            throw new BadRequestError(
                ERROR_CODE.TAX_BRACKET_NAME_INVALID,
                'Tax Bracket with same name already exist',
            );
        }
        const newTaxBracket = await TaxBracket.create({ name, rate });
        return TaxBracketService.convertToITaxBracketDataFormat(newTaxBracket);
    };

    static getOnlyTaxBrackets = async (): Promise<ITaxBracketData[]> => {
        const TaxBracket = TaxBracketService.getModal();
        const allTaxBracket = await TaxBracket.find({ group: { $exists: false } });
        logger.info(allTaxBracket);
        return allTaxBracket.map((taxBracket) =>
            TaxBracketService.convertToITaxBracketDataFormat(taxBracket),
        );
    };

    static getTaxBracket = async (bracketId: string): Promise<ITaxBracketData> => {
        const TaxBracket = TaxBracketService.getModal();
        const requiredTaxBracket = await TaxBracket.findById(bracketId);
        return TaxBracketService.convertToITaxBracketDataFormat(requiredTaxBracket);
    };

    static editTaxBracket = async (
        bracketId: string,
        taxBracketToUpdate: Pick<ITaxBracketData, 'name' | 'rate'>,
    ): Promise<ITaxBracketData> => {
        const TaxBracket = TaxBracketService.getModal();
        const updatedTaxBracket = await TaxBracket.findByIdAndUpdate(
            bracketId,
            taxBracketToUpdate,
            {
                new: true,
            },
        );
        return TaxBracketService.convertToITaxBracketDataFormat(updatedTaxBracket);
    };

    static deleteTaxBracket = async (bracketId: string): Promise<void> => {
        const TaxBracket = TaxBracketService.getModal();
        await TaxBracket.deleteOne({ _id: bracketId });
    };

    // tax group only block
    static getOnlyTaxGroups = async (): Promise<ITaxBracketData[]> => {
        const TaxBracket = TaxBracketService.getModal();
        const allTaxGroup = await TaxBracket.find({ group: { $exists: true } }).populate(
            TaxBracketService.getTaxGroupPopulateOptions(),
        );
        return allTaxGroup.map((taxGroup) =>
            TaxBracketService.convertToITaxGroupDataFormat(taxGroup),
        );
    };

    static getTaxGroup = async (taxGroupId: string): Promise<ITaxBracketData> => {
        const TaxBracket = TaxBracketService.getModal();
        const taxGroup = await TaxBracket.findOne({ _id: taxGroupId }).populate(
            TaxBracketService.getTaxGroupPopulateOptions(),
        );
        return TaxBracketService.convertToITaxGroupDataFormat(taxGroup);
    };

    static createTaxGroup = async (
        payload: Pick<ITaxBracketData, 'name' | 'group'>, // group should be array of tax bracket ids
    ): Promise<ITaxBracketData> => {
        const { name, group } = payload;
        const TaxBracket = TaxBracketService.getModal();

        const isGroupExist = await TaxBracket.exists({ name });
        if (isGroupExist) {
            throw new BadRequestError(
                ERROR_CODE.TAX_BRACKET_NAME_INVALID,
                'Tax Group with same name already exist',
            );
        }

        const matchedCount = await TaxBracket.countDocuments({ _id: { $in: group } });
        if (matchedCount !== group.length) {
            throw new BadRequestError(ERROR_CODE.TAX_GROUP_INVALID_BRACKET, 'Invalid Tax Bracket');
        }

        let newTaxGroup = await TaxBracket.create({ name, group });
        newTaxGroup = await newTaxGroup
            .populate(TaxBracketService.getTaxGroupPopulateOptions())
            .execPopulate();

        return TaxBracketService.convertToITaxGroupDataFormat(newTaxGroup);
    };

    static editTaxGroup = async (
        taxGroupId: string,
        taxGroupToUpdate: Pick<ITaxBracketData, 'name' | 'group'>, // group should be array of tax bracket ids
    ): Promise<ITaxBracketData> => {
        const TaxBracket = TaxBracketService.getModal();

        const updatedTaxGroup = await TaxBracket.findByIdAndUpdate(taxGroupId, taxGroupToUpdate, {
            new: true,
        }).populate(TaxBracketService.getTaxGroupPopulateOptions());

        return TaxBracketService.convertToITaxGroupDataFormat(updatedTaxGroup);
    };

    static deleteTaxGroup = async (taxGroupId: string): Promise<void> => {
        const TaxBracket = TaxBracketService.getModal();
        await TaxBracket.deleteOne({ _id: taxGroupId });
    };

    // both for tax group and bracket
    static searchTaxSetting = async (
        query: string,
        searchFor: 'onlyBrackets' | 'onlyGroups' | 'all',
    ): Promise<ITaxBracketData[]> => {
        const TaxBracket = TaxBracketService.getModal();

        const filterQuery: _FilterQuery<ITaxBracketDoc> = {
            name: new RegExp(`^${query}`, 'i'),
        };

        if (searchFor === 'onlyBrackets') {
            filterQuery.group = { $exists: false };
        } else if (searchFor === 'onlyGroups') {
            filterQuery.group = { $exists: true };
        }

        const matchedTaxBrackets = await TaxBracket.find(filterQuery).populate(
            TaxBracketService.getTaxGroupPopulateOptions(),
        );

        return matchedTaxBrackets.map((taxBracket) => {
            if (taxBracket.group) {
                return TaxBracketService.convertToITaxGroupDataFormat(taxBracket);
            }
            return TaxBracketService.convertToITaxBracketDataFormat(taxBracket);
        });
    };

    static getAllTaxBracketsAndGroups = async (): Promise<ITaxBracketData[]> => {
        const TaxBracket = TaxBracketService.getModal();

        const matchedTaxBrackets = await TaxBracket.find({}).populate(
            TaxBracketService.getTaxGroupPopulateOptions(),
        );

        return matchedTaxBrackets.map((taxBracket) => {
            if (taxBracket.group) {
                return TaxBracketService.convertToITaxGroupDataFormat(taxBracket);
            }
            return TaxBracketService.convertToITaxBracketDataFormat(taxBracket);
        });
    };
}
