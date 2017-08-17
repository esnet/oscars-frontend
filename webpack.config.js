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
    entry: ['babel-polyfill', './src/main/js/index.js'],
    devtool: 'sourcemaps',
    cache: true,
    output: {
        path: PATHS.build,
        publicPath: '/webjars/oscars-frontend/1.0.2/bundle.js',
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
                include: /node_modules/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: PATHS.templates + '/template_index.html',
            inject: 'body',
            favicon: PATHS.templates + '/favicon.ico',
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
            '/api/*': {
                secure: false,
                changeOrigin: true,
                target: 'https://localhost:8201/'
            },
            '/protected/*': {
                secure: false,
                changeOrigin: true,
                target: 'https://localhost:8201/'
            },
            '/admin/*': {
                secure: false,
                changeOrigin: true,
                target: 'https://localhost:8201/'
            }

        }
    }
};