const webpack = require("webpack");
const path = require("path");
const autoprefixer = require("autoprefixer");
 
module.exports = {
  mode: "development",
  entry: [
    path.join(__dirname, "/client/index.js")
  ],
  resolve: {
    modules: [path.resolve(__dirname, "src"), "node_modules"]
  },
  module: {
    rules: [
      {
        test: /\.js/,
				exclude: /node_modules/,
				use: ["babel-loader"]
      },
      {
        test: /\.(css|less)$/,
				loaders: ["style-loader", "css-loader", {
          loader: 'postcss-loader',
          options: {
            plugins: () => autoprefixer({
              browsers: ['last 3 versions', '> 1%']
            })
          }
        },
        "less-loader"]
      },
      {
        test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader : "file-loader"
      }
    ] 
  },
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },
  devtool: "inline-source-map",
  devServer: {
    contentBase: __dirname + '/dist',
    watchContentBase: true,
    historyApiFallback: true,
    stats: "minimal"
  }  
}