const path = require('path')

module.exports = {
  mode: 'development',

  devtool: 'inline-cheap-source-map', //生成一个没有line map的sourcemap文件
  entry: './src/index.js',
  output: {
    filename: 'mini-vue.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },

  devServer: {
    contentBase: './src/examples',
    publicPath: '/dist',
    watchContentBase: true
  }
}
