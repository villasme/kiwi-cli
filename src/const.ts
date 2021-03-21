/**
 * @author linhuiw
 * @desc 项目配置文件配置信息
 */

export const KIWI_CONFIG_FILE = 'kiwi-config.json';

export const PROJECT_CONFIG = {
  dir: './.kiwi',
  configFile: `./.kiwi/${KIWI_CONFIG_FILE}`,
  defaultConfig: {
    kiwiDir: './.kiwi',
    configFile: `./.kiwi/${KIWI_CONFIG_FILE}`,
    exemption: ".kiwi/exemption.js",
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
