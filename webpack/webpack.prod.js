const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const common = require('./common.js');
const util = require('./util');
const resolve = util.resolve;

const prodEnv = {
    NODE_ENV: JSON.stringify('production'),
    PLATFORM_ENV: JSON.stringify('web'),
    SERVER_URL: JSON.stringify('http://18.218.149.20:3000')
};

const stagingEnv = {
    NODE_ENV: JSON.stringify('staging'),
    PLATFORM_ENV: JSON.stringify('web'),
    SERVER_URL: JSON.stringify('https://staging-server.com/api')
};

const cssFilename_lib = 'static/css/lib.css?[hash:8]';
const cssFilename_app = 'static/css/app.css?[hash:8]';
const extractCSS_LIB = new ExtractTextPlugin(cssFilename_lib);
const extractCSS_APP = new ExtractTextPlugin(cssFilename_app);
module.exports = merge(common, {
    cache: false,
    performance: {
        hints: false
    },
    output: {
        path: resolve('dist'),
        chunkFilename: 'static/js/[name].bundle.js?[hash:8]',
        filename: 'static/js/[name].js?[hash:8]',
        publicPath: ''
    },
    // devtool: 'inline-source-map',
    stats: {
    // need it
        entrypoints: false,
        children: false
    },
    module: {
        strictExportPresence: true, // need this
        rules: [
            // {
            //     test: /\.(js|jsx)$/,
            //     enforce: 'pre',
            //     use: [
            //         {
            //             options: {
            //                 formatter: eslintFormatter,
            //                 eslintPath: require.resolve('eslint'),
            //             },
            //             loader: require.resolve('eslint-loader'),
            //         },
            //     ],
            //     include: resolve('src'),
            // },
            {
                oneOf: [
                    {
                        test: /\.(png|svg|jpg|gif)$/,
                        include: resolve('src'),
                        loader: 'file-loader',
                        options: {
                            limit: 10000,
                            name: '[name].[hash:8].[ext]',
                            publicPath: '/static/media',
                            outputPath: 'static/media'
                        }
                    },
                    {
                        test: /\.(js|jsx)$/,
                        include: resolve('src'),
                        loader: require.resolve('babel-loader'),
                        exclude: /node_modules/,
                        options: {
                            plugins: ['react-html-attrs'],
                            compact: true
                        }
                    },
                    {
                        test: /\.css$/,
                        use: extractCSS_LIB.extract({
                            fallback: 'style-loader',
                            use: [{loader: 'css-loader'}, {loader: 'postcss-loader'}]
                        })
                    },
                    {
                        test: /\.(scss)$/,
                        include: resolve('src'),
                        exclude: /node_modules/,
                        loader: extractCSS_APP.extract(
                            Object.assign({
                                fallback: require.resolve('style-loader'),
                                use: [
                                    {
                                        loader: require.resolve('css-loader'),
                                        options: {
                                            importLoaders: 1,
                                            minimize: true,
                                            sourceMap: true,
                                            publicPath: resolve('dist')
                                        }
                                    },
                                    {
                                        loader: require.resolve('postcss-loader')
                                        // options: {
                                        //     ident: 'postcss',
                                        //     plugins: () => [
                                        //         require('postcss-flexbugs-fixes'),
                                        //         autoprefixer({
                                        //             browsers: [
                                        //                 '>1%',
                                        //                 'last 4 versions',
                                        //                 'Firefox ESR',
                                        //                 'not ie < 9', // React doesn't support IE8 anyway
                                        //             ],
                                        //             flexbox: 'no-2009',
                                        //         }),
                                        //     ],
                                        // },
                                    },
                                    {
                                        loader: require.resolve('sass-loader')
                                    }
                                ],
                                publicPath: resolve('dist')
                            })
                        )
                    },
                    {
                        loader: require.resolve('file-loader'),
                        exclude: [/\.js$/, /\.html$/, /\.json$/],
                        options: {
                            name: 'static/media/[name].[hash:8].[ext]'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(resolve('dist')),
        // new FaviconsWebpackPlugin({
        //     logo: path.join(__dirname, 'public/favicon.png'),
        //     prefix: 'static/media/icon[hash:8]/',
        //     icons: { favicons: true },
        // }),
        new HtmlWebpackPlugin({
            sinject: true,
            template: resolve('public/index.html'),
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifySCSS: true,
                minifyURLs: true
            }
        }),
        extractCSS_LIB,
        extractCSS_APP,
        new webpack.DefinePlugin({
            'process.env':
        process.env.NODE_ENV === 'production' ? prodEnv : stagingEnv
        }),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ]
});
