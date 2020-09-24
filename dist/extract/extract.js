"use strict";
/**
 * @author doubledream
 * @desc 提取指定文件夹下的中文
 */
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const randomstring = require("randomstring");
const slash = require("slash2");
const path = require("path");
const file_1 = require("./file");
const findChineseText_1 = require("./findChineseText");
const getLangData_1 = require("./getLangData");
const utils_1 = require("../utils");
const replace_1 = require("./replace");
const utils_2 = require("../utils");
const CONFIG = utils_2.getProjectConfig();
/**
 * 递归匹配项目中所有的代码的中文
 */
function findAllChineseText(dir) {
    const dirPath = path.resolve(process.cwd(), dir);
    const files = file_1.getSpecifiedFiles(dirPath, CONFIG.ignoreDir, CONFIG.ignoreFile);
    const filterFiles = files.filter(file => {
        return file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.vue');
    });
    const allTexts = filterFiles.reduce((pre, file) => {
        const code = file_1.readFile(file);
        const texts = findChineseText_1.findChineseText(code, file);
        // 调整文案顺序，保证从后面的文案往前替换，避免位置更新导致替换出错
        const sortTexts = _.sortBy(texts, obj => -obj.range.start);
        if (texts.length > 0) {
            console.log(`${file} 发现中文文案`);
        }
        return texts.length > 0 ? pre.concat({ file, texts: sortTexts }) : pre;
    }, []);
    return allTexts;
}
/**
 * 递归匹配项目中所有的代码的中文
 * @param {dirPath} 文件夹路径
 */
function extractAll(dirPath) {
    // if (!CONFIG.googleApiKey) {
    //   console.log('请配置googleApiKey');
    //   return;
    // }
    const dir = dirPath || './';
    const allTargetStrs = findAllChineseText(dir);
    if (allTargetStrs.length === 0) {
        console.log('没有发现可替换的文案！');
        return;
    }
    allTargetStrs.forEach(item => {
        const currentFilename = item.file;
        const targetStrs = item.texts;
        const suggestPageRegex = /\/pages\/\w+\/([^\/]+)\/([^\/\.]+)/;
        let suggestion = [];
        const finalLangObj = getLangData_1.getSuggestLangObj();
        const virtualMemory = {};
        if (currentFilename.includes('/pages/')) {
            suggestion = currentFilename.match(suggestPageRegex);
        }
        if (suggestion) {
            suggestion.shift();
        }
        /** 如果没有匹配到 Key */
        if (!(suggestion && suggestion.length)) {
            const names = slash(currentFilename).split('/');
            const fileName = _.last(names);
            const fileKey = fileName.split('.')[0].replace(new RegExp('-', 'g'), '_');
            const dir = names[names.length - 2].replace(new RegExp('-', 'g'), '_');
            if (dir === fileKey) {
                suggestion = [dir];
            }
            else {
                suggestion = [dir, fileKey];
            }
        }
        // 翻译中文文案
        const translatePromises = targetStrs.reduce((prev, curr) => {
            // 避免翻译的字符里包含数字或者特殊字符等情况
            const reg = /[^a-zA-Z\x00-\xff]+/g;
            const findText = curr.text.match(reg);
            const transText = findText ? findText.join('').slice(0, 4) : '中文符号';
            return prev.concat(utils_1.translateText(transText, 'en_US'));
        }, []);
        Promise.all(translatePromises)
            .then(([...translateTexts]) => {
            const replaceableStrs = targetStrs.reduce((prev, curr, i) => {
                const key = utils_1.findMatchKey(finalLangObj, curr.text);
                if (!virtualMemory[curr.text]) {
                    if (key) {
                        virtualMemory[curr.text] = key;
                        return prev.concat({
                            target: curr,
                            key
                        });
                    }
                    const uuidKey = `${randomstring.generate({
                        length: 4,
                        charset: 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
                    })}`;
                    const handleText = translateTexts[i] ? _.camelCase(translateTexts[i]) : uuidKey;
                    const reg = /[a-zA-Z]+/;
                    // 对于翻译后的英文再次过滤，只保留英文字符
                    const purifyText = handleText
                        .split('')
                        .filter(letter => reg.test(letter))
                        .join('');
                    const transText = purifyText || 'chineseSymbols';
                    let transKey = `${suggestion.length ? suggestion.join('.') + '.' : ''}${transText}`;
                    let occurTime = 1;
                    // 防止出现前四位相同但是整体文案不同的情况
                    while (utils_1.findMatchValue(finalLangObj, transKey) !== curr.text &&
                        _.keys(finalLangObj).includes(`${transKey}${occurTime >= 2 ? occurTime : ''}`)) {
                        occurTime++;
                    }
                    if (occurTime >= 2) {
                        transKey = `${transKey}${occurTime}`;
                    }
                    virtualMemory[curr.text] = transKey;
                    finalLangObj[transKey] = curr.text;
                    return prev.concat({
                        target: curr,
                        key: transKey
                    });
                }
                else {
                    return prev.concat({
                        target: curr,
                        key: virtualMemory[curr.text]
                    });
                }
            }, []);
            replaceableStrs
                .reduce((prev, obj) => {
                return prev.then(() => {
                    return replace_1.replaceAndUpdate(currentFilename, obj.target, `I18N.${obj.key}`, false);
                });
            }, Promise.resolve())
                .then(() => {
                // 添加 import I18N
                if (!replace_1.hasImportI18N(currentFilename)) {
                    const code = replace_1.createImportI18N(currentFilename);
                    file_1.writeFile(currentFilename, code);
                }
                console.log(`${currentFilename}替换完成！`);
            })
                .catch(e => {
                console.log(e.message);
            });
        })
            .catch(err => {
            if (err) {
                console.log('翻译引擎出问题了...1');
            }
        });
    });
}
exports.extractAll = extractAll;
//# sourceMappingURL=extract.js.map