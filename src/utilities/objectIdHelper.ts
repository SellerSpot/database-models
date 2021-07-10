import { ObjectId } from 'mongodb';
import { createHash } from 'crypto';

/**
 * Constructs an ObjectId as string based on reference name.
 *
 * @param referenceName reference name
 */
export const getObjectIdAsString = (referenceName: string): string => {
    if (!referenceName) {
        throw new Error('ReferenceName cannot be empty');
    }

    const hash = createHash('sha1').update(referenceName, 'utf8').digest('hex'); // creates unique hash on seeding based on reference name passed in

    const hashSubSTring = hash.substring(0, 24);
    return hashSubSTring;
};

/**
 * Constructs an ObjectId instance based on reference name.
 *
 * @param referenceName reference name
 */
export const getObjectId = (referenceName: string): ObjectId => {
    return new ObjectId(getObjectIdAsString(referenceName));
};

/**
 * Constructs ObjectIds as stirng based on reference names.
 *
 * @param referenceNames Array of reference names
 */
export const getObjectIdsAsString = (referenceNames: string[]): string[] => {
    return referenceNames.map((referenceName) => getObjectIdAsString(referenceName));
};

/**
 * Constructs ObjectId instances based on reference names.
 *
 * @param referenceNames Array of reference names
 */
export const getObjectIds = (referenceNames: string[], isString = false): ObjectId[] => {
    return referenceNames.map((referenceName) => getObjectId(referenceName));
};
