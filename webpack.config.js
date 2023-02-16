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
    // 设置内容的根路径,使用该目录中真实存在的静态资源,而不是虚拟资源
    contentBase: './src/examples',
    contentBase: './dist',
    watchContentBase: true
  }
}
