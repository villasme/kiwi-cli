# kiwi cli 加强版

Kiwi 的 CLI 工具
支持Google翻译
支持百度翻译

## 如何使用

> yarn global add @villas/kiwi-clis

> 推荐与[Kiwi-国际化全流程解决方案](https://github.com/alibaba/kiwi)结合使用

> [百度翻译开放平台](http://api.fanyi.baidu.com/)

## CLI 参数

### v-kiwi `--init`

初始化项目，生成 kiwi 的配置文件 `kiwi-config.json`

```js
{
  // kiwi文件根目录，用于放置提取的langs文件
  "kiwiDir": "./.kiwi",

  // 配置文件目录，若调整配置文件，此处可手动修改
  "configFile": "./.kiwi/kiwi-config.json",

  // 语言目录名，注意连线和下划线
  "srcLang": "zh-CN",
  // "en-US", "zh-TW"
  "distLangs": ["en-US"],

  // googleApiKey - 使用百度翻译，此处不配置
  "googleApiKey": "",

  // “v-kiwi --sync” 时自动翻译 (true: 自动)
  "isAutoTranslate": true,

  // 百度APP ID
  "baiduAppid": "",
  // 百度密钥
  "baiduAK": ""

  // import 语句，不同项目请自己配置
  "importI18N": "",

  // 可跳过的文件夹名或者文加名，比如docs、mock等
  "ignoreDir": "",
  "ignoreFile": ""

}
```

### v-kiwi `--extract`

一键批量替换指定文件夹下的所有文案

```shell script
v-kiwi --extract [dirPath]
```

### v-kiwi `--import`

导入翻译文案，将翻译人员翻译的文案，导入到项目中

```shell script
# 导入送翻后的文案
v-kiwi --import [filePath] en-US
```

### v-kiwi `--export`

导出未翻译的文案

```shell script
# 导出指定语言的文案，lang取值为配置中distLangs值，如en-US导出还未翻译成英文的中文文案
v-kiwi --export [filePath] en-US
```

### v-kiwi `--sync`

同步各种语言的文案，同步未翻译文件

### v-kiwi `--mock`

使用 Google/百度 翻译，翻译未翻译的文案
