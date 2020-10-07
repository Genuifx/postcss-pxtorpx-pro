const pxRegex = require("./lib/pixel-unit-regex");
const filterPropList = require("./lib/filter-prop-list");
const type = require("./lib/type");

const defaults = {
  // rootValue: 16,
  unitPrecision: 5,
  unit: "rpx",
  selectorBlackList: [],
  propBlackList: [],
  replace: true,
  mediaQuery: false,
  minPixelValue: 0,
  exclude: null,
  // 默认设计稿按照750宽，2倍图的出
  transform: x => 2 * x
};

module.exports = options => {
  const opts = Object.assign({}, defaults, options);
  const unsatisfyPropList = createPropListMatcher(opts.propBlackList);
  const exclude = opts.exclude;
  const pxReplaceFunc = createPxReplace(
    opts.unit,
    opts.unitPrecision,
    opts.minPixelValue,
    opts.transform
  );
  // use flag to exclude process for specific file.
  let isExcludeFile = false;

  return {
    postcssPlugin: "postcss-pxtorpx-pro",
    Once(css) {
      const filePath = css.source.input.file;
      if (
        exclude &&
        ((type.isFunction(exclude) && exclude(filePath)) ||
          (type.isString(exclude) && filePath.indexOf(exclude) !== -1) ||
          (type.isRegExp(exclude) && filePath.match(exclude) !== null))
      ) {
        isExcludeFile = true;
        return;
      } else {
        isExcludeFile = false;
      }
    },
    Declaration(decl) {
      if (isExcludeFile) return;

      if (
        decl.value.indexOf("px") === -1 ||
        unsatisfyPropList(decl.prop) ||
        blacklistedSelector(opts.selectorBlackList, decl.parent.selector)
      )
        return;

      const value = decl.value.replace(pxRegex, pxReplaceFunc);

      // if rem unit already exists, do not add or replace
      if (declarationExists(decl.parent, decl.prop, value)) return;

      if (opts.replace) {
        decl.value = value;
      } else {
        decl.cloneAfter({ value: value });
      }
    },
    AtRule(atRule) {
      if (isExcludeFile) return;

      if (opts.mediaQuery && atRule.name === "media") {
        if (atRule.params.indexOf("px") === -1) return;
        atRule.params = atRule.params.replace(pxRegex, pxReplaceFunc);
      }
    }
  };
};

module.exports.postcss = true;

function createPxReplace(unit, unitPrecision, minPixelValue, transform) {
  return (m, $1) => {
    if (!$1) return m;
    const pixels = parseFloat($1);
    if (pixels < minPixelValue) return m;
    const fixedVal = toFixed(transform(pixels), unitPrecision);
    return fixedVal === 0 ? "0" : fixedVal + unit;
  };
}

function toFixed(number, precision) {
  const multiplier = Math.pow(10, precision + 1),
    wholeNumber = Math.floor(number * multiplier);
  return (Math.round(wholeNumber / 10) * 10) / multiplier;
}

function declarationExists(decls, prop, value) {
  return decls.some(decl => decl.prop === prop && decl.value === value);
}

function blacklistedSelector(blacklist, selector) {
  if (typeof selector !== "string") return;
  return blacklist.some(regex => {
    if (typeof regex === "string") {
      return selector.indexOf(regex) !== -1;
    }
    return selector.match(regex);
  });
}

function createPropListMatcher(propList) {
  const hasWild = propList.indexOf("*") > -1;
  const matchAll = hasWild && propList.length === 1;
  const lists = {
    exact: filterPropList.exact(propList),
    contain: filterPropList.contain(propList),
    startWith: filterPropList.startWith(propList),
    endWith: filterPropList.endWith(propList),
    notExact: filterPropList.notExact(propList),
    notContain: filterPropList.notContain(propList),
    notStartWith: filterPropList.notStartWith(propList),
    notEndWith: filterPropList.notEndWith(propList)
  };
  return prop => {
    if (matchAll) return true;
    return (
      (hasWild ||
        lists.exact.indexOf(prop) > -1 ||
        lists.contain.some(function(m) {
          return prop.indexOf(m) > -1;
        }) ||
        lists.startWith.some(function(m) {
          return prop.indexOf(m) === 0;
        }) ||
        lists.endWith.some(function(m) {
          return prop.indexOf(m) === prop.length - m.length;
        })) &&
      !(
        lists.notExact.indexOf(prop) > -1 ||
        lists.notContain.some(function(m) {
          return prop.indexOf(m) > -1;
        }) ||
        lists.notStartWith.some(function(m) {
          return prop.indexOf(m) === 0;
        }) ||
        lists.notEndWith.some(function(m) {
          return prop.indexOf(m) === prop.length - m.length;
        })
      )
    );
  };
}
