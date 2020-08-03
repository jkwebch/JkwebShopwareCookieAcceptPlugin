import JkwebShopwareCookieAcceptPlugin from './jk-cookie-accept-plugin/jk-cookie-accept-plugin.plugin';
const PluginManager = window.PluginManager;

PluginManager.register('JkwebShopwareCookieAcceptPlugin', JkwebShopwareCookieAcceptPlugin);

if (module.hot) {
    module.hot.accept();
}
