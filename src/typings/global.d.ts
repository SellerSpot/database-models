import { IUserJwtTokenPayload } from '@sellerspot/universal-types';

declare global {
    namespace NodeJS {}
    namespace Express {
        interface Request {
            currentTenant?: IUserJwtTokenPayload;
        }
    }
}

// convert it into a module by adding an empty export statement.
export {};
