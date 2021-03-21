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
exports.mockLangs = exports.getMockTexts = exports.getDistText = void 0;
/**
 * @author linhuiw
 * @desc 翻译方法
 * @TODO: index 文件需要添加 mock
 */
require('ts-node').register({
    compilerOptions: {
        module: 'commonjs'
    }
});
const path = require("path");
const fs = require("fs");
const _ = require("lodash");
const utils_1 = require("./utils");
const CONFIG = utils_1.getProjectConfig();
/**
 * 获取中文文案
 */
function getSourceText() {
    const srcLangDir = utils_1.getLangDir(CONFIG.srcLang);
    const srcFile = path.resolve(srcLangDir, 'index.ts');
    const { default: texts } = require(srcFile);
    return texts;
}
/**
 * 获取对应语言文案
 * @param dstLang
 */
function getDistText(dstLang) {
    const distLangDir = utils_1.getLangDir(dstLang);
    const distFile = path.resolve(distLangDir, 'index.ts');
    let distTexts = {};
    if (fs.existsSync(distFile)) {
        distTexts = require(distFile).default;
    }
    return distTexts;
}
exports.getDistText = getDistText;
/**
 * 获取对应语言mock文案
 * @param dstLang
 */
function getMockTexts(dstLang) {
    const distLangDir = utils_1.getLangDir(dstLang);
    const distFile = path.resolve(distLangDir, 'mock.ts');
    let mockTexts = {};
    if (fs.existsSync(distFile)) {
        mockTexts = require(distFile).default;
    }
    return mockTexts;
}
exports.getMockTexts = getMockTexts;
/**
 * Mock 对应语言
 * @param dstLang
 */
function mockCurrentLang(dstLang) {
    return __awaiter(this, void 0, void 0, function* () {
        const texts = getSourceText();
        const distTexts = getDistText(dstLang);
        const untranslatedTexts = {};
        const mocks = getMockTexts(dstLang);
        /** 遍历文案 */
        utils_1.traverse(texts, (text, path) => {
            const distText = _.get(distTexts, path);
            if (text === distText) {
                untranslatedTexts[path] = text;
            }
        });
        /** 调用 Google 翻译 */
        const translateAllTexts = Object.keys(untranslatedTexts).map(key => {
            return new Promise((resolve, reject) => {
                if (mocks[key]) {
                    console.warn('\n\t <mocks> key:%s 存在mocks中：value %s', key, mocks[key]);
                    resolve([key, mocks[key]]);
                }
                else {
                    console.warn(`\n\t准备翻译：key: ${key} ,  文案： ${untranslatedTexts[key]} `);
                    resolve(utils_1.translateText(untranslatedTexts[key], dstLang).then(translatedText => [key, translatedText]));
                }
            });
        });
        /** 获取 Mocks 文案 */
        yield Promise.all(translateAllTexts).then(res => {
            res.forEach(([key, translatedText]) => {
                mocks[key] = translatedText;
            });
            return mocks;
        });
        console.log('开始写入...');
        return writeMockFile(dstLang, mocks);
    });
}
/**
 * 写入 Mock 文件
 * @param dstLang
 * @param mocks
 */
function writeMockFile(dstLang, mocks) {
    const fileContent = 'export default ' + JSON.stringify(mocks, null, 2);
    const filePath = path.resolve(utils_1.getLangDir(dstLang), 'mock.ts');
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, fileContent, err => {
            if (err) {
                reject(err);
            }
            else {
                console.log('写入完成');
                resolve();
            }
        });
    });
}
/**
 * Mock 语言的未翻译的文案
 * @param lang
 */
function mockLangs(lang) {
    return __awaiter(this, void 0, void 0, function* () {
        const CONFIG = utils_1.getProjectConfig();
        const langs = lang ? [lang] : CONFIG.distLangs;
        const mockPromise = langs.map(lang => {
            return mockCurrentLang(lang);
        });
        return Promise.all(mockPromise);
    });
}
exports.mockLangs = mockLangs;
//# sourceMappingURL=mock.js.map