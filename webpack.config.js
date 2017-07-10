var packageJSON = require('./package.json');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
// var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

const PATHS = {
    build: path.join(__dirname, 'target', 'classes', 'META-INF', 'resources', 'webjars', packageJSON.name, packageJSON.version),
    templates: path.join(__dirname, 'src', 'main', 'resources', 'templates')
};

module.exports = {
    entry: ['./src/main/js/index.js'],
    devtool: 'sourcemaps',
    cache: true,
    output: {
        path: PATHS.build,
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js|\.jsx/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'react', 'stage-1'],
                    plugins: ['transform-decorators-legacy']
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: PATHS.templates + '/template_index.html',
            inject: 'body'
        }),
        /*
        new LodashModuleReplacementPlugin,
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        */
    ],

    devServer: {
        port: 8181,
        contentBase: PATHS.build,
        historyApiFallback: {
            index: 'index.html'
        },
        watchOptions: {
            poll: 1000
        },
        proxy: {
            '/topology/*': {
                secure: false,
                changeOrigin: true,
                target: 'https://localhost:8001/'
            },
            '/viz/*': {
                secure: false,
                changeOrigin: true,
                target: 'https://localhost:8001/'
            },
            '/resv/*': {
                secure: false,
                changeOrigin: true,
                target: 'https://localhost:8001/'
            },
            '/vlan/*': {
                secure: false,
                changeOrigin: true,
                target: 'https://localhost:8001/'
            }

        }
    }
};