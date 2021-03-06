"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = void 0;
const utils_1 = require("./utils");
let task = [];
let translateStatus;
function get(params, callback) {
    return utils_1.baiduTranslate(params.text, params.toLang, callback);
}
function app() {
    translateStatus = true;
    const list = task.splice(0, 8);
    const array = [];
    for (let i = 0, len = list.length; i < len; i++) {
        const item = list[i];
        array.push(get(item.params, item.callback));
    }
    Promise.all(array).then(function () {
        if (task.length > 0) {
            setTimeout(app, 2000);
        }
        else {
            translateStatus = false;
        }
    });
}
function run(params, callback) {
    task.push({
        params: params,
        callback: callback
    });
    if (translateStatus) {
        return;
    }
    app();
}
function translate(text, toLang = 'en_US') {
    return function (callback) {
        run({ text, toLang }, callback);
    };
}
exports.translate = translate;
//# sourceMappingURL=baidu.js.map