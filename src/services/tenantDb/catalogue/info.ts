import { merge } from 'lodash';
import { Model } from 'mongoose';
import { logger } from '@sellerspot/universal-functions';
import { IOutletSettingData } from '@sellerspot/universal-types';
import { ECatalogueInfoType, IInfoDoc } from '../../../models/tenantDb/catalogueModels/info';
import { DbConnectionManager, MONGOOSE_MODELS } from '../../..';

export class InfoService {
    static getModal = (): Model<IInfoDoc> =>
        DbConnectionManager.getTenantModel<IInfoDoc>(MONGOOSE_MODELS.TENANT_DB.CATALOGUE.INFO);

    static getOutletSettings = async (): Promise<IOutletSettingData> => {
        const InfoModal = InfoService.getModal();
        const infoJson = (
            await InfoModal.findOne({ infoType: ECatalogueInfoType.OUTLET_SETTINGS })
        )?.toJSON();
        return infoJson?.[ECatalogueInfoType.OUTLET_SETTINGS];
    };

    static updateOutletSettings = async (
        outletSettings: IOutletSettingData,
    ): Promise<IOutletSettingData> => {
        const InfoModal = InfoService.getModal();
        const info = await InfoModal.findOne({ infoType: ECatalogueInfoType.OUTLET_SETTINGS });
        // if the document is not present, create and return the default outlet
        if (!info) {
            const defaultOutletJson = (
                await InfoModal.create({
                    infoType: ECatalogueInfoType.OUTLET_SETTINGS,
                    [ECatalogueInfoType.OUTLET_SETTINGS]: {
                        defaultOutlet: outletSettings.defaultOutlet,
                    },
                })
            )?.toJSON();
            logger.info('Default outlet set');
            return defaultOutletJson[ECatalogueInfoType.OUTLET_SETTINGS];
        }
        const infoJson = info?.toJSON();
        const previousOutletSettings = infoJson?.[ECatalogueInfoType.OUTLET_SETTINGS];
        info[ECatalogueInfoType.OUTLET_SETTINGS] = merge(previousOutletSettings, outletSettings);
        await info.save();
        return info.toJSON()?.[ECatalogueInfoType.OUTLET_SETTINGS];
    };
}
