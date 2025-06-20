const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production', // Use production mode for minification
  entry: './renderer.ts', // Single entry point that imports the other files
  output: {
    filename: 'bundle.js', // Output a single bundled file
    path: path.resolve(__dirname, 'public'),
    library: {
      type: 'module'
    }
  },
  experiments: {
    outputModule: true, // Enable ES modules output
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true // Skip type checking
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false, // Remove comments
          },
          compress: {
            drop_console: false, // Keep console logs for debugging
            drop_debugger: true
          }
        },
        extractComments: false
      })
    ]
  }
};
