import joi from 'joi';

type TError = Error & { errors: Error[] };
/**
 * Common error handler
 *
 * @returns {TError} formatted result error
 */
export const errorHandler = (error: unknown): TError => {
    const resultError: TError = { name: '', message: '', errors: [], stack: '' };
    if (error instanceof joi.ValidationError) {
        const validationError: joi.ValidationError = error;
        resultError.name = validationError.name;
        resultError.message = 'some validation error';
        validationError.details.map((detail, key) => {
            detail.path.map((path) => {
                resultError.errors.push({
                    name: path.toString(),
                    message: detail.message,
                });
            });
        });
    } else if (error instanceof CustomError) {
        const customErrorError: CustomError = error;
        resultError.message = customErrorError.message;
        resultError.name = 'customErrorError';
    }

    return resultError;
};

// custom error handler classes

export class CustomError implements Error {
    public message;
    public name;
    public stack;
    constructor(name: Error['name'], message: Error['message'], stack?: Error['stack']) {
        this.name = name;
        this.message = message;
        this.stack = stack;
    }
}
