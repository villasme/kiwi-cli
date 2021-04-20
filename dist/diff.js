"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diff = void 0;
/**
 * @file 文案比较
 * @author villas
 * @description 文案比较
 * 比较两个文案差异， 判断 file1 中的文案在 file2 中是否存在，将差异保存到 exportDiff.csv 中
 */
require('ts-node').register({
    compilerOptions: {
        module: 'commonjs'
    }
});
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const d3_dsv_1 = require("d3-dsv");
function getFileContent(src) {
    const content = fs.readFileSync(src).toString();
    const messages = d3_dsv_1.tsvParseRows(content, row => {
        let key;
        let value;
        let more = [];
        row = _.compact([].concat(row));
        if (row[0] === '行号') {
            return void 0;
        }
        if (row.length === 1) {
            const text = row[0];
            const indexOf = text.indexOf(',');
            key = text.slice(0, indexOf);
            value = text.slice(indexOf + 1);
        }
        else {
            const first = _.trim(_.first(row));
            if (/^[0-9]+$/i.test(first)) {
                key = row[1];
                value = row[2];
                more = row.slice(3);
            }
            else {
                key = row[0];
                value = row[1];
                more = row.slice(2);
            }
        }
        if (key && value) {
            value = value.replace(/""/g, '"');
            if (value.slice(0, 1) === '"') {
                value = value.slice(1);
            }
            if (value.slice(-1) === '"') {
                value = value.slice(0, -1);
            }
            return [].concat(key, value, more);
        }
        return void 0;
    });
    const rst = {};
    const duplicateKeys = new Set();
    messages.forEach(item => {
        const key = item[0];
        if (rst.hasOwnProperty(key)) {
            duplicateKeys.add(key);
        }
        rst[key] = item.slice(1);
    });
    if (duplicateKeys.size > 0) {
        const errorMessage = 'Duplicate messages detected: \n' + [...duplicateKeys].join('\n');
        console.error(errorMessage);
        process.exit(1);
    }
    return rst;
}
function diff(morePath, lessPath, outputPath) {
    // 只取命令行中的前两个参数
    const langs = [morePath, lessPath];
    const result = _.map(langs, function (src) {
        return getFileContent(src);
    });
    const data = [];
    let maxLine = 0;
    _.each(result[0], function (value, key) {
        // 判断第一个文件中的 key 是否在第二个文件中存在
        if (key in result[1]) {
            const item = result[1][key];
            // 默认两边的数据相同
            let flag = true;
            // const len = _.size(value);
            const len = 1;
            for (let i = 0; i < len; i++) {
                if (value[i] !== item[i]) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                return;
            }
        }
        const tmp = [].concat(key, value);
        data.push(tmp);
        if (tmp.length > maxLine) {
            maxLine = tmp.length;
        }
    });
    console.log('\n');
    console.log('firstFilePath length = %s', _.size(result[0]));
    console.log('secondFilePath length = %s', _.size(result[1]));
    console.log('diff length = %s', _.size(data));
    let title = [];
    if (maxLine === 1) {
        title = ['行号', 'key'];
    }
    else if (maxLine === 2) {
        title = ['行号', 'key', '英文'];
    }
    else if (maxLine === 3) {
        title = ['行号', 'key', '英文', '中文'];
    }
    const list = [].concat([title], _.map(data, function (value, index) {
        return [].concat(index + 1, value);
    }));
    const content = d3_dsv_1.tsvFormatRows(list);
    fs.writeFileSync(path.resolve(outputPath), content);
}
exports.diff = diff;
//# sourceMappingURL=diff.js.map