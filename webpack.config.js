const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Helpers
const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';
const prodPlugin = plugin => isProd ? plugin : undefined;
const removeEmpty = array => array.filter(i => !!i);

const APP_DIR = path.join(__dirname, '..', 'app');

module.exports = {
    entry: {
        // app: './app/index.ts',
        // app: path.resolve(APP_DIR,'index'),
        app: './index.ts',
        vendor: ['react']
        // vendor: [''],
    },
    output: {
        filename: '[name].[chunkhash].js',
        // filename: '[name].js',
        // path: resolve(__dirname, 'dist'),
        // publicPath: '/static/', //no public path included in original prod config
        // pathinfo: !env.prod,
        // path: path.join(__dirname, './static'),
        // path: '',
        // path: isProd ? join(__dirname, '..', 'build/static') : join(__dirname, '..', 'build'),
    },
    debug: true,

    context: path.resolve(__dirname, 'app'),

    devtool: isProd ? 'hidden-source-map' : 'source-map',
    bail: isProd,
    module: {
        preLoaders: [{
            test: /\.ts?$/,
            loader: 'tslint',
            include: APP_DIR
        }],
        loaders: [
            {test: /\.js|jsx$/, loader: 'babel', exclude: /node_modules/},
            {test: /\.ts|tsx?$/, loaders: ['ts']},
            {test: /\.css$/, loader: 'style!css'},
            {
                test: /\.woff$/,
                loader: 'file',
                query: {
                    name: 'public/fonts/[name].[ext]'
                },
            },
            {test: /\.worker.js$/, loader: "worker-loader" },

            // { //Use imports-loader on a non node-module file to expose a require in this case it use lodash
            //   test: require.resolve('./src/js/non-node-modules/something-that-uses-lodash-but-doesnt-require-it.js'),
            //   loader: 'imports?_=lodash'
            // },
            // { // Import a non es6 file that doesn't have a module.exports and is saved to the global namespace.
            //   // imports loader creates an empty object named window
            //   // exports loader saves the given variable to module.exports
            //   test: require.resolve('./src/js/non-node-modules/something-saved-on-window-not-module.exports.js'),
            //   loaders: ['imports?window={}','exports?leftPad'],
            // },
        ],
    },
    plugins: removeEmpty([
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'template.html',
        }),

        // new webpack.HotModuleReplacementPlugin(),

        new webpack.NoErrorsPlugin(),

        prodPlugin(new webpack.optimize.OccurrenceOrderPlugin()),

        prodPlugin(new webpack.optimize.DedupePlugin()),

        prodPlugin(new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        })),

        prodPlugin(new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(nodeEnv),
            },
        })),

        prodPlugin(new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true,
                warnings: false,
            },
            output: {
                comments: false
            },
            sourceMap: false,
            mangle: false, // breaks recorder js otherwise
        })),

        prodPlugin(new CopyWebpackPlugin([
            { from: 'index.html', to: '../' },
            { from: 'manifest.json', to: '../' },
            { from: 'background.js', to: '../' },
            { from: 'icon-16.png', to: '../' },
            { from: 'icon-128.png', to: '../' },
            { from: 'config.xml', to: '../../phonegap/theremin' },
            { from: 'index.html', to: '../../phonegap/theremin/www' },
        ])),

        prodPlugin(new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: Infinity,
            filename: '[name].bundle.[chunkhash].js'
        })),

        // // plugin to replace /static/app.js to static/app-[hash].js in the build index file
        // // check here for a nicer version in the future: https://github.com/webpack/webpack/issues/86
        // function () {
        //     this.plugin("done", function (stats) {
        //         var replaceInFile = function (filePath, toReplace, replacement) {
        //             var replacer = function (match) {
        //                 console.log('Replacing in %s: %s => %s', filePath, match, replacement);
        //                 return replacement
        //             };
        //             var str = fs.readFileSync(filePath, 'utf8');
        //             var out = str.replace(new RegExp(toReplace, 'g'), replacer);
        //             fs.writeFileSync(filePath, out);
        //         };
        //
        //         var hash = stats.hash; // Build's hash, found in `stats` since build lifecycle is done.
        //
        //         replaceInFile('build/index.html', '/static/app.js', 'static/app-' + hash + '.js');
        //     });
        // },
    ]),
    resolve: {
        modules: [path.resolve(APP_DIR), 'node_modules'],
        extensions: ['', '.ts', '.tsx', '.js'],
    },
    tslint: {
        emitErrors: true,
        failOnHint: true
    },
    devServer: {
        contentBase: './app'
        // hot: true
    },
    node: {
        fs: "empty"
    },
};
