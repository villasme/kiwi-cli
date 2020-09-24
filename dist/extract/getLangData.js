"use strict";
/**
 * @author doubledream
 * @desc 获取语言文件
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLangData = exports.getSuggestLangObj = void 0;
const globby = require("globby");
const fs = require("fs");
const path = require("path");
const utils_1 = require("../utils");
const CONFIG = utils_1.getProjectConfig();
const LANG_DIR = path.resolve(CONFIG.kiwiDir, CONFIG.srcLang);
const I18N_GLOB = `${LANG_DIR}/**/*.ts`;
/**
 * 获取对应文件的语言
 */
function getLangData(fileName) {
    if (fs.existsSync(fileName)) {
        return getLangJson(fileName);
    }
    else {
        return {};
    }
}
exports.getLangData = getLangData;
/**
 * 获取文件 Json
 */
function getLangJson(fileName) {
    const fileContent = fs.readFileSync(fileName, { encoding: 'utf8' });
    let obj = fileContent.match(/export\s*default\s*({[\s\S]+);?$/)[1];
    obj = obj.replace(/\s*;\s*$/, '');
    let jsObj = {};
    try {
        jsObj = eval('(' + obj + ')');
    }
    catch (err) {
        console.log(obj);
        console.error(err);
    }
    return jsObj;
}
function getI18N() {
    const paths = globby.sync(I18N_GLOB);
    const langObj = paths.reduce((prev, curr) => {
        const filename = curr
            .split('/')
            .pop()
            .replace(/\.tsx?$/, '');
        if (filename.replace(/\.tsx?/, '') === 'index') {
            return prev;
        }
        const fileContent = getLangData(curr);
        let jsObj = fileContent;
        if (Object.keys(jsObj).length === 0) {
            console.log(`\`${curr}\` 解析失败，该文件包含的文案无法自动补全`);
        }
        return Object.assign(Object.assign({}, prev), { [filename]: jsObj });
    }, {});
    return langObj;
}
/**
 * 获取全部语言, 展平
 */
function getSuggestLangObj() {
    const langObj = getI18N();
    const finalLangObj = utils_1.flatten(langObj);
    return finalLangObj;
}
exports.getSuggestLangObj = getSuggestLangObj;
//# sourceMappingURL=getLangData.js.map