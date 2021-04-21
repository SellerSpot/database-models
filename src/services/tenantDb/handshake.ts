import { LeanDocument } from 'mongoose';
import { DbConnectionManager } from '../../config/initializer';
import { MONGOOSE_MODELS } from '../../models';
import { ITenant } from '../../models/coreDb/Tenant';
import { ITenantHandshake } from '../../models/tenantDb/TenantHandshake';

export const createHandshake = async (
    props: Pick<LeanDocument<Required<ITenant>>, 'id' | 'name' | 'email' | 'storeName'>,
): Promise<LeanDocument<ITenantHandshake>> => {
    const conn = DbConnectionManager.getTenantDb();
    const TenantHandshake = conn.model<ITenantHandshake>(
        MONGOOSE_MODELS.TENANT_DB.TENANT_HANDSHAKE,
    );
    const tenantHandsake: ITenantHandshake = await TenantHandshake.create({
        name: props.name,
        email: props.email,
        storeName: props.storeName,
        tenant: props.id,
    });
    return tenantHandsake.toJSON();
};
