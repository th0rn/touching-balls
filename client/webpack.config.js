module.exports = {
    entry: "./src/js/main.js",
    output: {
        path: __dirname + "/dist",
        filename: "bundle.js",
    },
    externals: {
        pixi: "PIXI"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    },
    devServer: {
        contentBase: "dist/",
    }
};
