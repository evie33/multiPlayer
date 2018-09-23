module.exports = {
  entry: './public/js/index.js',
  output: {
    path: __dirname + '/public',
    filename: 'demo.min.js'
  },
  devtool: 'source-map',
  mode: 'none',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader']
      }
    ]
  }
};
