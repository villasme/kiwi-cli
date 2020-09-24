/**
 * @author linhuiw
 * @desc 翻译文件
 */
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs'
  }
});
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import { traverse, getProjectConfig, getLangDir, translateText } from './utils';
const CONFIG = getProjectConfig();

/** 是否自动机翻 */
const isAuto = CONFIG.isAutoTranslate;

/**
 * 获取中文文案文件的翻译，优先使用已有翻译，若找不到则使用 google 翻译
 * */
async function getTranslations(file: string, toLang: any) {
  const translations: any = {};
  const fileNameWithoutExt = path.basename(file).split('.')[0];
  const srcLangDir = getLangDir(CONFIG.srcLang);
  const distLangDir = getLangDir(toLang);
  const srcFile = path.resolve(srcLangDir, file);
  const distFile = path.resolve(distLangDir, file);
  const { default: texts } = require(srcFile);
  let distTexts: any;
  if (fs.existsSync(distFile)) {
    distTexts = require(distFile).default;
  }

  traverse(texts, async (text: any, path: string) => {
    const key = fileNameWithoutExt + '.' + path;
    const distText = _.get(distTexts, path);
    if (isAuto) {
      const autoText = distText
        ? [key, distText, text]
        : translateText(text, toLang).then(translatedText => [key, translatedText, text]);
      translations[key] = Promise.resolve(autoText);
    } else {
      translations[key] = Promise.resolve([key, distText || text, text]);
    }
  });

  return translations;
}

/**
 * 将翻译写入文件
 * */
function writeTranslations(file: string, toLang: any, translations: { [x: string]: any }) {
  const fileNameWithoutExt = path.basename(file).split('.')[0];
  const srcLangDir = getLangDir(CONFIG.srcLang);
  const srcFile = path.resolve(srcLangDir, file);
  const { default: texts } = require(srcFile);
  const rst = {};

  traverse(texts, (text: any, path: any) => {
    const key = fileNameWithoutExt + '.' + path;
    // 使用 setWith 而不是 set，保证 numeric key 创建的不是数组，而是对象
    // https://github.com/lodash/lodash/issues/1316#issuecomment-120753100
    _.setWith(rst, path, translations[key], Object);
  });

  const fileContent = 'export default ' + JSON.stringify(rst, null, 2);
  const filePath = path.resolve(getLangDir(toLang), path.basename(file));
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, fileContent, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * 需要翻译的对应文件
 * @param file
 * @param toLang
 */
async function translateFile(file: string, toLang: any) {
  const translations = await getTranslations(file, toLang);
  /** 调用 Google 翻译 */
  const translateAllTexts = {};
  await Promise.all(Object.values(translations)).then((res: any) => {
    res.forEach(([key, translatedText, text]) => {
      translateAllTexts[key] = translatedText;
      console.info(`\n\t key(${key}) zh-CN: ${text} -> ${toLang}: ${translatedText}`);
    });
    return translateAllTexts;
  });
  const toLangDir = path.resolve(__dirname, `../${toLang}`);
  if (!fs.existsSync(toLangDir)) {
    fs.mkdirSync(toLangDir);
  }

  writeTranslations(file, toLang, translateAllTexts);
}

/**
 * 拷贝即将翻译的所有文件
 */
function sync(callback?: Function) {
  const srcLangDir = getLangDir(CONFIG.srcLang);
  fs.readdir(srcLangDir, (err, files) => {
    if (err) {
      console.error(err);
    } else {
      files = files.filter(file => file.endsWith('.ts') && file !== 'index.ts' && file !== 'mock.ts').map(file => file);
      const translateFiles = (toLang: any) =>
        Promise.all(
          files.map(file => {
            translateFile(file, toLang);
          })
        );
      Promise.all(CONFIG.distLangs.map(translateFiles)).then(
        () => {
          const langDirs = CONFIG.distLangs.map(getLangDir);
          langDirs.map(dir => {
            const filePath = path.resolve(dir, 'index.ts');
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir);
            }
            fs.copyFileSync(path.resolve(srcLangDir, 'index.ts'), filePath);
          });
          callback && callback();
        },
        e => {
          console.error(e);
          process.exit(1);
        }
      );
    }
  });
}

export { sync };
