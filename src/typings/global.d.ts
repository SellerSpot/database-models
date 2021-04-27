/* eslint-disable prettier/prettier */
import { ITenantJWTToken } from '@sellerspot/universal-types';

declare global {
    namespace NodeJS {}
    namespace Express {
        interface Request {
            currentTenant?: ITenantJWTToken;
        }
    }
}

// convert it into a module by adding an empty export statement.
export { };

