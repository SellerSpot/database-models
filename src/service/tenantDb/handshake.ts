import { logger } from '@sellerspot/universal-functions';
import { LeanDocument } from 'mongoose';
import { DbConnectionManager } from '../../config/initializer';
import { MONGOOSE_MODELS } from '../../model';
import { ITenant } from '../../model/coreDb/Tenant';
import { ITenantHandshake } from '../../model/tenantDb/TenantHandshake';

export const createHandshake = async (
    props: Pick<LeanDocument<Required<ITenant>>, 'id' | 'name' | 'email' | 'storeName'>,
): Promise<void> => {
    try {
        DbConnectionManager.setTenantDb(props.id);
        const conn = DbConnectionManager.getTenantDb();
        const TenantHandshake = conn.model<ITenantHandshake>(
            MONGOOSE_MODELS.TENANT_DB.TENANT_HANDSHAKE,
        );
        await TenantHandshake.create({
            name: props.name,
            email: props.email,
            storeName: props.storeName,
            tenant: props.id,
        });
    } catch (error) {
        logger.error(`Tenant handsake creation failed - ${props.id} error-${error}`);
    }
};
