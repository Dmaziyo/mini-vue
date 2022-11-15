const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',

  devtool: 'inline-cheap-source-map', //生成一个没有line map的sourcemap文件
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  plugins: [
    // 自动生成html文件，并且引用bundle的文件
    new HtmlWebpackPlugin({
      title: 'mini-vue3'
    })
  ],
  devServer: {
    // 设置内容的根路径
    contentBase: './dist'
  }
}
