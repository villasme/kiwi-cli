"use strict";
/**
 * @author linhuiw
 * @desc 项目配置文件配置信息
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROJECT_CONFIG = exports.KIWI_CONFIG_FILE = void 0;
exports.KIWI_CONFIG_FILE = 'kiwi-config.json';
exports.PROJECT_CONFIG = {
    dir: './.kiwi',
    configFile: `./.kiwi/${exports.KIWI_CONFIG_FILE}`,
    defaultConfig: {
        kiwiDir: './.kiwi',
        configFile: `./.kiwi/${exports.KIWI_CONFIG_FILE}`,
        srcLang: 'zh-CN',
        distLangs: ['en-US'],
        googleApiKey: '',
        translateOptions: {
            concurrentLimit: 10,
            requestOptions: {}
        },
        isAutoTranslate: true,
        importI18N: `import I18N from 'src/utils/I18N';`,
        ignoreDir: '',
        ignoreFile: '',
        baiduAppid: '',
        baiduAK: ''
    },
    langMap: {
        ['en-US']: 'en',
        ['en_US']: 'en',
        ['zh-TW']: 'cht',
        ['zh_TW']: 'cht'
    },
    zhIndexFile: `import common from './common';

export default Object.assign({}, {
  common
});`,
    zhTestFile: `export default {
    test: '测试'
  }`
};
//# sourceMappingURL=const.js.map