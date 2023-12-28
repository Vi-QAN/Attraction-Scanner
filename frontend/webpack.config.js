const path = require('path');
const BundleTracker = require('webpack-bundle-tracker');
const { InjectManifest } = require('workbox-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    context: __dirname,
    entry: './src/index.js',
    output: {
        path: path.resolve('./static/frontend/'),  // Adjust the output path based on your Django static files configuration
        filename: '[name]-[hash].js',
    },
    plugins: [
        new BundleTracker({ filename: 'webpack-stats.json' }),
        new InjectManifest({
            swSrc: path.resolve(__dirname, 'serviceworker.mjs'), // Path to your service worker file
            modifyURLPrefix: {
                '': '/static/frontend/',
            },
            additionalManifestEntries: [
                'static/manifest.json'
            ]
        }),
        // new MiniCssExtractPlugin({filename: '[name]-[hash].css'}),
    ],
    module: {
        rules: [
            // Add any necessary loaders for your project
            // For example, babel-loader for transpiling JavaScript using Babel
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                  loader: 'babel-loader',
                },
            },
            // {
            //     test: /\.css$/,
            //     use: [
            //       MiniCssExtractPlugin.loader,
            //       'css-loader',
            //     ],
            // },
        ],
    },
}