"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sync = void 0;
/**
 * @author villas
 * @desc 翻译文件
 */
require('ts-node').register({
    compilerOptions: {
        module: 'commonjs'
    }
});
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const utils_1 = require("./utils");
const mock_1 = require("./mock");
const CONFIG = utils_1.getProjectConfig();
/** 是否自动机翻 */
const isAuto = CONFIG.isAutoTranslate;
/**
 * 获取中文文案文件的翻译，优先使用已有翻译，若找不到则使用 google 翻译
 * */
function getTranslations(file, toLang) {
    return __awaiter(this, void 0, void 0, function* () {
        const translations = {};
        const fileNameWithoutExt = path.basename(file).split('.')[0];
        const srcLangDir = utils_1.getLangDir(CONFIG.srcLang);
        const distLangDir = utils_1.getLangDir(toLang);
        const mocks = mock_1.getMockTexts(toLang);
        const exemption = utils_1.getExemption();
        const distTextsAll = mock_1.getDistText(toLang);
        const srcFile = path.resolve(srcLangDir, file);
        const distFile = path.resolve(distLangDir, file);
        const { default: texts } = require(srcFile);
        let distTexts;
        if (fs.existsSync(distFile)) {
            distTexts = require(distFile).default;
        }
        utils_1.traverse(texts, (text, path) => __awaiter(this, void 0, void 0, function* () {
            const key = fileNameWithoutExt + '.' + path;
            const distText = _.get(distTexts, path);
            const distTextsValue = _.get(distTextsAll, key);
            if (distTextsValue) {
                translations[key] = Promise.resolve([key, distTextsValue, text]);
                console.info(`\n\t <${toLang}-${key}> key(${key}) zh-CN: ${text} -> ${toLang}: ${distTextsValue}`);
                return;
            }
            if (toLang === 'en_US' && exemption[key]) {
                translations[key] = Promise.resolve([key, exemption[key], text]);
                console.info(`\n\t <exemption> key(${key}) zh-CN: ${text} -> ${toLang}: ${exemption[key]}`);
                return;
            }
            if (mocks[key]) {
                translations[key] = Promise.resolve([key, mocks[key], text]);
                console.info(`\n\t <mock> key(${key}) zh-CN: ${text} -> ${toLang}: ${mocks[key]}`);
                return;
            }
            if (isAuto) {
                const autoText = distText
                    ? [key, distText, text]
                    : utils_1.translateText(text, toLang).then(translatedText => {
                        return [key, translatedText, text];
                    });
                translations[key] = Promise.resolve(autoText);
            }
            else {
                translations[key] = Promise.resolve([key, distText || text, text]);
            }
        }));
        return translations;
    });
}
/**
 * 将翻译写入文件
 * */
function writeTranslations(file, toLang, translations) {
    const fileNameWithoutExt = path.basename(file).split('.')[0];
    const srcLangDir = utils_1.getLangDir(CONFIG.srcLang);
    const srcFile = path.resolve(srcLangDir, file);
    const { default: texts } = require(srcFile);
    const rst = {};
    utils_1.traverse(texts, (text, path) => {
        const key = fileNameWithoutExt + '.' + path;
        // 使用 setWith 而不是 set，保证 numeric key 创建的不是数组，而是对象
        // https://github.com/lodash/lodash/issues/1316#issuecomment-120753100
        _.setWith(rst, path, translations[key], Object);
    });
    const fileContent = 'export default ' + JSON.stringify(rst, null, 2);
    const filePath = path.resolve(utils_1.getLangDir(toLang), path.basename(file));
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, fileContent, err => {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
}
/**
 * 需要翻译的对应文件
 * @param file
 * @param toLang
 */
function translateFile(file, toLang) {
    return __awaiter(this, void 0, void 0, function* () {
        const translations = yield getTranslations(file, toLang);
        /** 调用 Google 翻译 */
        const translateAllTexts = {};
        yield Promise.all(Object.values(translations)).then((res) => {
            res.forEach(([key, translatedText, text]) => {
                translateAllTexts[key] = translatedText;
                console.info(`\n\t key(${key}) zh-CN: ${text} -> ${toLang}: ${translatedText}`);
            });
            return translateAllTexts;
        });
        const toLangDir = path.resolve(__dirname, `../${toLang}`);
        if (!fs.existsSync(toLangDir)) {
            yield fs.mkdirSync(toLangDir);
        }
        writeTranslations(file, toLang, translateAllTexts);
    });
}
/**
 * 拷贝即将翻译的所有文件
 */
function sync(callback) {
    const srcLangDir = utils_1.getLangDir(CONFIG.srcLang);
    /** 初始化语言种类目录 */
    CONFIG.distLangs.forEach(langStr => {
        const langPath = utils_1.getLangDir(langStr);
        if (!fs.existsSync(langPath)) {
            fs.mkdirSync(langPath);
            console.info(`\n同步文件：${langPath}`);
        }
    });
    fs.readdir(srcLangDir, (err, files) => {
        if (err) {
            console.error(err);
        }
        else {
            files = files.filter(file => file.endsWith('.ts') && file !== 'index.ts' && file !== 'mock.ts').map(file => file);
            const translateFiles = (toLang) => Promise.all(files.map(file => {
                translateFile(file, toLang);
            }));
            Promise.all(CONFIG.distLangs.map(translateFiles)).then(() => {
                const langDirs = CONFIG.distLangs.map(utils_1.getLangDir);
                langDirs.map(dir => {
                    const filePath = path.resolve(dir, 'index.ts');
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }
                    fs.copyFileSync(path.resolve(srcLangDir, 'index.ts'), filePath);
                });
                callback && callback();
            }, e => {
                console.error(e);
                process.exit(1);
            });
        }
    });
}
exports.sync = sync;
//# sourceMappingURL=sync.js.map