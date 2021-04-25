import { logger } from '@sellerspot/universal-functions';
import { DbConnectionManager } from '../../configs/initializer';
import { MONGOOSE_MODELS } from '../../models';
import { ITenant } from '../../models/coreDb/Tenant';
import { ITenantHandshake } from '../../models/tenantDb/TenantHandshake';

export const createHandshake = async (
    props: Pick<Required<ITenant>, 'id' | 'name' | 'email' | 'storeName'>,
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
