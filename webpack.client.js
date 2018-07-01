const path = require('path');

module.exports = {
  target: 'web',
  mode: 'development',
  entry: './src/client.js',
  output: {
    path: path.resolve(__dirname, 'public/assets/js'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/react', '@babel/preset-env'],
            plugins: ['module:@babel/plugin-proposal-class-properties']
          }
        }
      }
    ]
  }
};
