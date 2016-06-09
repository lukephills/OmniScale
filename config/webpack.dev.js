var webpack = require('webpack');
var path = require('path');

var APP_DIR = path.join(__dirname, '..', 'app');

module.exports = {
    debug: true,
    devtool: 'source-map',
    entry: ['./app/index.ts'],
    module: {
        preLoaders: [{
            test: /\.ts?$/,
            loader: 'tslint',
            include: APP_DIR
        }],
        loaders: [
            {
                test: /\.ts?$/,
                loaders: ['babel','ts'],
                include: APP_DIR
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            { test: /\.woff$/, loader: 'file?name=public/fonts/[name].[ext]' },
            { test: /\.worker.js$/, loader: "worker-loader" }
        ]
    },
    output: {
        filename: 'app.js',
        path: path.join(__dirname, '..', 'build'),
        publicPath: '/static/'
    },
    plugins: [
        // new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],
    resolve: {
        root: [path.resolve('../app')],
        extensions: ['', '.js', '.ts']
    }
};
