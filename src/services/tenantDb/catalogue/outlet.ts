import { DbConnectionManager, MONGOOSE_MODELS } from '../../..';
import { IOutletDoc } from '../../../models/tenantDb/catalogueModels';
import { Model } from 'mongoose';

export class OutletDbService {
    static getModal = (): Model<IOutletDoc> => {
        return DbConnectionManager.getTenantModel<IOutletDoc>(
            MONGOOSE_MODELS.TENANT_DB.CATALOGUE.OUTLET,
        );
    };
}
