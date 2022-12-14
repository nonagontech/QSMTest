const { fixBabelImports, override, addLessLoader, addWebpackAlias, removeModuleScopePlugin } = require('customize-cra');
const path = require("path");



module.exports = override(
  // 针对antd实现按需打包: 根据import来打包(使用babel-plugin-import)
  fixBabelImports('inport', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,  // 自动打包相关的样式
  }),

  // 使用less-loader对源码中的less的变量进行重新指定,纯实现按需打包不需要
  addLessLoader({
    lessOptions: {
      javascriptEnabled: true,
      // modifyVars: { '@primary-color': '#e1206d' },//配置antd主题颜色
    }
  }),

  //别名配置
  addWebpackAlias({
    ["@"]: path.resolve(__dirname, "./src")
  }),
  removeModuleScopePlugin()
)


