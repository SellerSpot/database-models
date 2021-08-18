import { Model } from 'mongoose';
import { merge } from 'lodash';
import { IBillA4Settings, IBillSettings } from '@sellerspot/universal-types';
import { DbConnectionManager } from '../../../configs/DbConnectionManager';
import { MONGOOSE_MODELS } from '../../../models';
import { EPOSInfoType, IInfoDoc } from '../../../models/tenantDb/pointOfSaleModels/info';

export class InfoService {
    static getModel = (): Model<IInfoDoc> =>
        DbConnectionManager.getTenantModel<IInfoDoc>(MONGOOSE_MODELS.TENANT_DB.POINT_OF_SALE.INFO);

    static getBillSettings = async (): Promise<IBillSettings> => {
        const InfoModel = InfoService.getModel();
        const info = await (
            await InfoModel.findOne({ infoType: EPOSInfoType.BILL_SETTINGS })
        )?.toJSON();
        let billSettings = info?.[EPOSInfoType.BILL_SETTINGS];
        if (!billSettings) {
            const storeDetails = {
                // fetch from tenant details
                name: 'Developer Store',
                address: 'No 69, Develper Store,\nChennai\n621211\n8489455901',
            };
            const remarkMessage: IBillA4Settings['remarkMessage'] = {
                show: true,
                data: 'Thanks for shopping with us!',
            };
            const termsAndConditions: IBillA4Settings['termsAndConditions'] = {
                show: true,
                data:
                    '1. We declare that this invoice shows the actual price of the goods describe and that all particulars are true and correct\n',
            };
            // seed billSettings for first time
            const info = (
                await InfoModel.create({
                    infoType: EPOSInfoType.BILL_SETTINGS,
                    [EPOSInfoType.BILL_SETTINGS]: {
                        defaultBill: 'BILL_A4',
                        bills: {
                            BILL_A4: {
                                storeDetails,
                                GSTNumber: {
                                    show: true,
                                    data: '1234235234234',
                                },
                                footerMessage: {
                                    show: true,
                                    data: 'This is a computer generated bill',
                                },
                                taxInvoiceSection: {
                                    show: true,
                                    GSTNumber: true,
                                    billingAddress: true,
                                    shippingAddress: true,
                                },
                                purchaseInvoiceSection: {
                                    show: true,
                                    MRPColumn: true,
                                    discountColumn: true,
                                    taxColumn: true,
                                },
                                purchaseSummarySection: {
                                    totalDiscount: true,
                                    youSaved: true,
                                },
                                taxSplitUpSection: {
                                    show: true,
                                },
                                remarkMessage,
                                termsAndConditions: {
                                    show: true,
                                    data: '1. This is a terms and conditions\n2. It can be a list',
                                },
                                signature: {
                                    authorised: true,
                                    customer: true,
                                },
                            },
                            BILL_90MM: {
                                storeDetails,
                                remarkMessage,
                            },
                        },
                    },
                })
            ).toJSON();
            billSettings = info?.[EPOSInfoType.BILL_SETTINGS];
        }
        return billSettings;
    };

    static updateBillSettings = async (billSettings: IBillSettings): Promise<IBillSettings> => {
        const InfoModel = InfoService.getModel();
        const info = await InfoModel.findOne({ infoType: EPOSInfoType.BILL_SETTINGS });
        const infoJson = info?.toJSON();
        const previousBillSettings = infoJson?.[EPOSInfoType.BILL_SETTINGS];
        const newBillSettings = merge(previousBillSettings, billSettings);
        info[EPOSInfoType.BILL_SETTINGS] = newBillSettings;
        await info.save();
        return info.toJSON()?.[EPOSInfoType.BILL_SETTINGS];
    };
}
