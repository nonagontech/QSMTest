/**
 * @file setupProxy.js
 * @author 胡邵杰
 * @date 2022/08/19
 * 
 */
const { createProxyMiddleware } = require('http-proxy-middleware')


const createProxy = (url = '', target = '') =>
    createProxyMiddleware(url, {
        target,
        changeOrigin: true,
        pathRewrite: {
            [`^${url}`]: '',
        },
    })



/**
 * 默认代理
 */
module.exports = function (app) {
    app.use(
        createProxy('/api', `http://192.168.0.16:31667`),//开发
    )
}


