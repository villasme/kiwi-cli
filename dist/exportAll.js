"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAllMessages = void 0;
/**
 * @author linhuiw
 * @desc 导出未翻译文件
 */
require('ts-node').register({
    compilerOptions: {
        module: 'commonjs'
    }
});
const fs = require("fs");
const d3_dsv_1 = require("d3-dsv");
const utils_1 = require("./utils");
function exportAllMessages(file, lang) {
    const CONFIG = utils_1.getProjectConfig();
    const langs = lang ? [lang] : CONFIG.distLangs;
    langs.map(lang => {
        const allMessages = utils_1.getAllMessages(CONFIG.srcLang);
        // const existingTranslations = getAllMessages(
        //   lang,
        //   (message, key) => !/[\u4E00-\u9FA5]/.test(allMessages[key]) || allMessages[key] !== message
        // );
        const messagesToTranslate = Object.keys(allMessages)
            // .filter(key => !existingTranslations.hasOwnProperty(key))
            .map(key => {
            let message = allMessages[key];
            message = JSON.stringify(message).slice(1, -1);
            return [key, message];
        });
        if (messagesToTranslate.length === 0) {
            console.log('All the messages have been translated.');
            return;
        }
        const content = d3_dsv_1.csvFormatRows(messagesToTranslate);
        const sourceFile = file || `./export-${lang}`;
        fs.writeFileSync(sourceFile, content);
        console.log(`Exported ${messagesToTranslate.length} message(s).`);
    });
}
exports.exportAllMessages = exportAllMessages;
//# sourceMappingURL=exportAll.js.map