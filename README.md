# postcss-pxtorpx-pro ![Node.js CI](https://github.com/Genuifx/postcss-pxtorpx-pro/workflows/Node.js%20CI/badge.svg) [![npm version](https://badge.fury.io/js/postcss-pxtorpx-pro.svg)](https://badge.fury.io/js/postcss-pxtorpx-pro)

本项目从[pxtorem](https://github.com/cuth/postcss-pxtorem)基础上修改而来，转换px单位为rpx，并允许指定任意单位及其转换函数，支持指定黑名单prop。

由于可以指定需要转换的单位和转化函数，故该插件理论上可以将px单位转为任意单位。默认转为rpx单位。

This repo is fork from [pxtorem](https://github.com/cuth/postcss-pxtorem), but more powerful than it. This plugin can transform pixels unit to any unit theoretically, which default transform to `rpx` unit.

`rpx` is the unit make for developing mini-program, see [@wxa](https://webank.gitee.io/wxa/)

A plugin for [PostCSS](https://github.com/ai/postcss) that generates rpx units from pixel units.

## Install

```shell
$ npm install postcss-pxtorpx-pro --save-dev
```

## Usage

像素是web开发中最常用的单位，但在做响应式页面开发之时稍显无力，开发者需要编写大量适配代码。故在移动端开发中我们常搭配rem, vw等单位使用，而在开发各类小程序中，我们又常用rpx取代vw。

Pixels are the easiest unit to use (*opinion*). The only issue with them is that they don't let browsers change the default font size of 16. This script converts every px value to a rem from the properties you choose to allow the browser to set the font size.


### Input/Output

*With the default settings, only font related properties are targeted.*

```css
// input
h1 {
    margin: 0 0 20px;
    font-size: 32px;
    line-height: 1.2;
    letter-spacing: 1px;
}

// output
h1 { 
  margin: 0 0 40rpx; 
  font-size: 64rpx; 
  line-height: 1.2; 
  letter-spacing: 2rpx; 
}
```

### Example

```js
var fs = require('fs');
var postcss = require('postcss');
var pxtorpx = require('postcss-pxtorpx-pro');
var css = fs.readFileSync('main.css', 'utf8');
var options = {
    replace: false
};
var processedCss = postcss(pxtorpx(options)).process(css).css;

fs.writeFile('main-rpx.css', processedCss, function (err) {
  if (err) {
    throw err;
  }
  console.log('Rpx file written.');
});
```

### options

Type: `Object | Null`  
Default:
```js
{
  // 转化的单位
  unit: 'rpx',
  // 单位精度
  unitPrecision: 5,
  // 不需要处理的css选择器
  selectorBlackList: [],
  // 不需要转化的css属性
  propBlackList: [], 
  // 直接修改px，还是新加一条css规则
  replace: true,
  // 是否匹配媒介查询的px
  mediaQuery: false,
  // 需要转化的最小的pixel值，低于该值的px单位不做转化
  minPixelValue: 0,
  // 不处理的文件
  exclude: null,
  // 转化函数
  // 默认设计稿按照750宽，2倍图的出
  transform: (x) => 2*x
}
```
- `unit`(String) The unit transform to. default `rpx`.
- `unitPrecision` (Number) The decimal numbers to allow the rpx units to grow to.
- `transform` (Function) function to transform pixels to other unit. default `(x) => 2 * x`.
- `propBlackList` (Array) The properties that can change from px to rpx.
    - Values need to be exact matches.
    - Use wildcard `*` to enable all properties. Example: `['*']`
    - Use `*` at the start or end of a word. (`['*position*']` will match `background-position-y`)
    - Use `!` to not match a property. Example: `['*', '!letter-spacing']`
    - Combine the "not" prefix with the other prefixes. Example: `['*', '!font*']` 
- `selectorBlackList` (Array) The selectors to ignore and leave as px.
    - If value is string, it checks to see if selector contains the string.
        - `['body']` will match `.body-class`
    - If value is regexp, it checks to see if the selector matches the regexp.
        - `[/^body$/]` will match `body` but not `.body`
- `replace` (Boolean) Replaces rules containing rpxs instead of adding fallbacks.
- `mediaQuery` (Boolean) Allow px to be converted in media queries.
- `minPixelValue` (Number) Set the minimum pixel value to replace.
- `exclude` (String, Regexp, Function) The file path to ignore and leave as px.
    - If value is string, it checks to see if file path contains the string.
        - `'exclude'` will match `\project\postcss-pxtorpx\exclude\path`
    - If value is regexp, it checks to see if file path matches the regexp.
        - `/exclude/i` will match `\project\postcss-pxtorpx\exclude\path`
    - If value is function, you can use exclude function to return a true and the file will be ignored.
        - the callback will pass the file path as  a parameter, it should returns a Boolean result.
        - `function (file) { return file.indexOf('exclude') !== -1; }`

### Use with gulp-postcss and autoprefixer

```js
var gulp = require('gulp');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var pxtorpx = require('postcss-pxtorpx-pro');

gulp.task('css', function () {

    var processors = [
        autoprefixer({
            browsers: 'last 1 version'
        }),
        pxtorpx({
            replace: false
        })
    ];

    return gulp.src(['build/css/**/*.css'])
        .pipe(postcss(processors))
        .pipe(gulp.dest('build/css'));
});
```

### A message about ignoring properties
Currently, the easiest way to have a single property ignored is to use a capital in the pixel unit declaration.

```css
// `px` is converted to `rem`
.convert {
    font-size: 16px; // converted to 1rem
}

// `Px` or `PX` is ignored by `postcss-pxtorpx` but still accepted by browsers
.ignore {
    border: 1Px solid; // ignored
    border-width: 2PX; // ignored
}
```


### REF

开发本插件之前，没有留意到已经有童鞋做了一个[类似的](https://github.com/dnxbf321/postcss-pxtorpx), 不过看下功能，本插件应该更加强大一些，故取其同名加pro。

