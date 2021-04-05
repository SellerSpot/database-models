import { ITenant } from '../../models/coreDb/Tenant';
import joi from 'joi';
import { errorHandler } from '../../utilities/erroHandler';
import { dbs, tenantWrapper } from '../../config/initializer';
import { introduceDelay } from '@sellerspot/universal-functions';
import { coreDbModels, MONGOOSE_MODELS } from '../../models';
/**
 * creates a tenant if necessary props are passed
 *
 * @returns document of the created tenant
 */
export const createTenant = async (
    props: Pick<ITenant, 'name' | 'email' | 'password' | 'storeName'>,
): Promise<ITenant | Error> => {
    try {
        // validation block
        const validatedProps: typeof props = await joi
            .object(<
                {
                    [key in keyof typeof props]: joi.AnySchema;
                }
            >{
                email: joi.string().email().required(),
                name: joi.string().min(3).max(15).required(),
                password: joi.string().min(4).required(),
                storeName: joi.string().min(3).required(),
            })
            .validateAsync(props, { abortEarly: false });

        // database operation block
        const TenantModel: coreDbModels.TenantModel.ITenantModel = dbs.core.model(
            MONGOOSE_MODELS.CORE_DB.TENANT,
        );

        const tenant = await TenantModel.create({
            name: validatedProps.name,
            storeName: validatedProps.storeName,
            email: validatedProps.email,
            password: validatedProps.password,
        });

        // success promise resolving block
        return Promise.resolve(tenant);
    } catch (error) {
        // error catching promise rejection block
        return Promise.reject(errorHandler(error));
    }
};

// tenant wrapper sample
export const performATenantDbRelatedOperation = tenantWrapper(
    async (props: { name: string }): Promise<string> => {
        await introduceDelay(6000);
        // will have current requested tenant's db
        if (dbs.tenant) {
            console.log('intializeConfig active and tenantDb valid');
        } else {
            console.log('intializeConfig inActive and tenantDb Invalid');
        }
        return props.name;
    },
);

// uncomment to check how tenantWrapped function works
// performATenantDbRelatedOperation('tenantIdskgs', { name: 'boom' });
