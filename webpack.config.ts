import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import path from 'path';
import { Configuration, DefinePlugin } from 'webpack';
import nodeExternals from 'webpack-node-externals';
import { WebpackCustomRunScriptsPlugin } from '@sellerspot/webpack-run-scripts-custom-plugin';

const webpackConfiguration = (env: {
    production?: boolean;
    development?: boolean;
}): Configuration => {
    const isProduction = env.production ? true : false;
    return {
        entry: './src',
        target: 'node',
        externals: [nodeExternals()],
        resolve: {
            extensions: ['.ts', '.d.ts'],
        },
        output: {
            path: path.join(__dirname, '/dist'),
            filename: 'index.js',
            libraryTarget: 'umd',
            umdNamedDefine: true,
            library: 'database-models',
            globalObject: 'this', // refernceError: self isnot defined fix
        },
        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/i,
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: !isProduction, // this generates .d.ts when it is false
                    },
                },
            ],
        },
        plugins: [
            new CleanWebpackPlugin(),
            new ForkTsCheckerWebpackPlugin({
                eslint: {
                    files: './src',
                },
            }),
            !isProduction
                ? new WebpackCustomRunScriptsPlugin({
                      command: 'npm run build:dev',
                  })
                : new DefinePlugin({}),
        ],
        devtool: false,
        watch: !isProduction,
    };
};

export default webpackConfiguration;
