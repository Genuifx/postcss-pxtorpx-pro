// Jasmine unit tests
// To run tests, run these commands from the project root:
// 1. `npm install -g jasmine-node`
// 2. `jasmine-node spec`

/* global describe, it, expect */

"use strict";
var postcss = require("postcss");
var pxtorpx = require("..");
var basicCSS = ".rule { font-size: 15px }";

describe("pxtorpx", function() {
  it("should work on the readme example", function() {
    var input =
      "h1 { margin: 0 0 20px; font-size: 32px; line-height: 1.2; letter-spacing: 1px; }";
    var output =
      "h1 { margin: 0 0 40rpx; font-size: 64rpx; line-height: 1.2; letter-spacing: 2rpx; }";
    var processed = postcss(pxtorpx()).process(input).css;

    expect(processed).toBe(output);
  });

  it("should replace the px unit with rpx", function() {
    var processed = postcss(pxtorpx()).process(basicCSS).css;
    var expected = ".rule { font-size: 30rpx }";

    expect(processed).toBe(expected);
  });

  it("should ignore non px properties", function() {
    var expected = ".rule { font-size: 2em }";
    var processed = postcss(pxtorpx()).process(expected).css;

    expect(processed).toBe(expected);
  });

  it("should ignore px in custom property names", function() {
    var rules =
      ":root { --rpx-14px: 14px; } .rule { font-size: var(--rpx-14px); }";
    var expected =
      ":root { --rpx-14px: 28rpx; } .rule { font-size: var(--rpx-14px); }";

    var processed = postcss(pxtorpx()).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should handle < 1 values and values without a leading 0", function() {
    var rules = ".rule { margin: 0.5rpx .5px -0.2px -.2em }";
    var expected = ".rule { margin: 0.5rpx 1rpx -0.4rpx -.2em }";
    var options = {};
    var processed = postcss(pxtorpx(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should not add properties that already exist", function() {
    var expected = ".rule { font-size: 16px; font-size: 32rpx; }";
    var processed = postcss(pxtorpx()).process(expected).css;

    expect(processed).toBe(expected);
  });

  it("should remain unitless if 0", function() {
    var expected = ".rule { font-size: 0px; font-size: 0; }";
    var processed = postcss(pxtorpx()).process(expected).css;

    expect(processed).toBe(expected);
  });
});

describe("value parsing", function() {
  it("should not replace values in double quotes or single quotes", function() {
    var options = {};
    var rules =
      ".rule { content: '16px'; font-family: \"16px\"; font-size: 16px; }";
    var expected =
      ".rule { content: '16px'; font-family: \"16px\"; font-size: 32rpx; }";
    var processed = postcss(pxtorpx(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should not replace values in `url()`", function() {
    var options = {};
    var rules = ".rule { background: url(16px.jpg); font-size: 16px; }";
    var expected = ".rule { background: url(16px.jpg); font-size: 32rpx; }";
    var processed = postcss(pxtorpx(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should not replace values with an uppercase P or X", function() {
    var options = {};
    var rules =
      ".rule { margin: 12px calc(100% - 14PX); height: calc(100% - 20px); font-size: 12Px; line-height: 16px; }";
    var expected =
      ".rule { margin: 24rpx calc(100% - 14PX); height: calc(100% - 40rpx); font-size: 12Px; line-height: 32rpx; }";
    var processed = postcss(pxtorpx(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe("unit", function() {
  it("should replace with specific unit", function() {
    var expected = ".rule { font-size: 30rem }";
    var options = {
      unit: "rem"
    };
    var processed = postcss(pxtorpx(options)).process(basicCSS).css;

    expect(processed).toBe(expected);
  });
});

describe("unitPrecision", function() {
  it("should replace using a decimal of 2 places", function() {
    var css = ".rule { margin: 0.24px }";
    var expected = ".rule { margin: 0.5rpx }";
    var options = {
      unitPrecision: 1
    };
    var processed = postcss(pxtorpx(options)).process(css).css;

    expect(processed).toBe(expected);
  });
});

describe("propBlackList", function() {
  it("should not replace properties in the prop list", function() {
    var css =
      ".rule { font-size: 16px; margin: 16px; margin-left: 5px; padding: 5px; padding-right: 16px }";
    var expected =
      ".rule { font-size: 16px; margin: 16px; margin-left: 10rpx; padding: 10rpx; padding-right: 16px }";
    var options = {
      propBlackList: ["*font*", "margin*", "!margin-left", "*-right", "pad"]
    };
    var processed = postcss(pxtorpx(options)).process(css).css;

    expect(processed).toBe(expected);
  });

  it("should not only replace properties in the prop list with wildcard", function() {
    var css =
      ".rule { font-size: 16px; margin: 16px; margin-left: 5px; padding: 5px; padding-right: 16px }";
    var expected =
      ".rule { font-size: 32rpx; margin: 16px; margin-left: 10rpx; padding: 10rpx; padding-right: 32rpx }";
    var options = {
      propBlackList: ["*", "!margin-left", "!*padding*", "!font*"]
    };
    var processed = postcss(pxtorpx(options)).process(css).css;

    expect(processed).toBe(expected);
  });

  it("should replace all properties when white list is empty", function() {
    var rules = ".rule { margin: 16px; font-size: 15px }";
    var expected = ".rule { margin: 32rpx; font-size: 30rpx }";
    var options = {
      propBlackList: []
    };
    var processed = postcss(pxtorpx(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe("selectorBlackList", function() {
  it("should ignore selectors in the selector black list", function() {
    var rules = ".rule { font-size: 15px } .rule2 { font-size: 15px }";
    var expected = ".rule { font-size: 30rpx } .rule2 { font-size: 15px }";
    var options = {
      selectorBlackList: [".rule2"]
    };
    var processed = postcss(pxtorpx(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should ignore every selector with `body$`", function() {
    var rules =
      "body { font-size: 16px; } .class-body$ { font-size: 16px; } .simple-class { font-size: 16px; }";
    var expected =
      "body { font-size: 32rpx; } .class-body$ { font-size: 16px; } .simple-class { font-size: 32rpx; }";
    var options = {
      selectorBlackList: ["body$"]
    };
    var processed = postcss(pxtorpx(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should only ignore exactly `body`", function() {
    var rules =
      "body { font-size: 16px; } .class-body { font-size: 16px; } .simple-class { font-size: 16px; }";
    var expected =
      "body { font-size: 16px; } .class-body { font-size: 32rpx; } .simple-class { font-size: 32rpx; }";
    var options = {
      selectorBlackList: [/^body$/]
    };
    var processed = postcss(pxtorpx(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe("replace", function() {
  it("should leave fallback pixel unit with root em value", function() {
    var options = {
      replace: false
    };
    var processed = postcss(pxtorpx(options)).process(basicCSS).css;
    var expected = ".rule { font-size: 15px; font-size: 30rpx }";

    expect(processed).toBe(expected);
  });
});

describe("mediaQuery", function() {
  it("should replace px in media queries", function() {
    var options = {
      mediaQuery: true
    };
    var processed = postcss(pxtorpx(options)).process(
      "@media (min-width: 500px) { .rule { font-size: 16px } }"
    ).css;
    var expected = "@media (min-width: 1000rpx) { .rule { font-size: 32rpx } }";

    expect(processed).toBe(expected);
  });

  it("should not replace px in media queries", function() {
    var options = {
      mediaQuery: false
    };
    var processed = postcss(pxtorpx(options)).process(
      "@media (min-width: 500px) { .rule { font-size: 16px } }"
    ).css;
    var expected = "@media (min-width: 500px) { .rule { font-size: 32rpx } }";

    expect(processed).toBe(expected);
  });
});

describe("minPixelValue", function() {
  it("should not replace values below minPixelValue", function() {
    var options = {
      minPixelValue: 2
    };
    var rules =
      ".rule { border: 1px solid #000; font-size: 16px; margin: 1px 10px; }";
    var expected =
      ".rule { border: 1px solid #000; font-size: 32rpx; margin: 1px 20rpx; }";
    var processed = postcss(pxtorpx(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe("transform", function() {
  it("should use custom transform function to transform unit", function() {
    var options = {
      transform: pixels => pixels
    };
    var rules =
      ".rule { border: 1px solid #000; font-size: 16px; margin: 1px 10px; }";
    var expected =
      ".rule { border: 1rpx solid #000; font-size: 16rpx; margin: 1rpx 10rpx; }";
    var processed = postcss(pxtorpx(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe("exclude", function() {
  it("should ignore file path with exclude RegEx", function() {
    var options = {
      exclude: /exclude/i
    };
    var processed = postcss(pxtorpx(options)).process(basicCSS, {
      from: "exclude/path"
    }).css;
    expect(processed).toBe(basicCSS);
  });

  it("should not ignore file path with exclude String", function() {
    var options = {
      exclude: "exclude"
    };
    var processed = postcss(pxtorpx(options)).process(basicCSS, {
      from: "exclude/path"
    }).css;
    expect(processed).toBe(basicCSS);
  });

  it("should not ignore file path with exclude function", function() {
    var options = {
      exclude: function(file) {
        return file.indexOf("exclude") !== -1;
      }
    };
    var processed = postcss(pxtorpx(options)).process(basicCSS, {
      from: "exclude/path"
    }).css;
    expect(processed).toBe(basicCSS);
  });
});
