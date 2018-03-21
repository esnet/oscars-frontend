var packageJSON = require('./package.json');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var webpack = require('webpack');
// var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

const PATHS = {
    build: path.join(__dirname, 'target', 'classes', 'META-INF', 'resources', 'webjars', packageJSON.name, packageJSON.version),
    templates: path.join(__dirname, 'src', 'main', 'resources', 'templates')
};

module.exports = {
    entry: ['babel-polyfill', './src/main/js/index.js'],
//    devtool: 'eval',
    cache: true,
    output: {
        path: PATHS.build,
        publicPath: '/webjars/oscars-frontend/1.0.9/bundle.js',
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
                    presets: ['env', 'react', 'stage-1'],
                    plugins: ['transform-decorators-legacy']
                }
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                    'file-loader'
                ],
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                            /*

                            sourceMap: true,
                            convertToAbsoluteUrls: true
                            */
                        }
                    },
                    'css-loader'

                ]
            },

        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: PATHS.templates + '/template_index.html',
            inject: 'body',
            favicon: PATHS.templates + '/favicon.ico',
        }),

        /*
        new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en)$/),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.optimize.AggressiveMergingPlugin(),
            new UglifyJsPlugin(),
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify('production')
                }
            })
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