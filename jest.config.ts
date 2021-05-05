import { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
    return {
        preset: 'ts-jest',
        modulePathIgnorePatterns: ['<rootDir>/.yalc', '<rootDir>/node_modules'],
        testEnvironment: 'node',
    };
};
