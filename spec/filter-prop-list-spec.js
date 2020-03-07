// Jasmine unit tests
// To run tests, run these commands from the project root:
// 1. `npm install -g jasmine-node`
// 2. `jasmine-node spec`

/* global describe, it, expect */

"use strict";
var filterPropList = require("../lib/filter-prop-list");

describe("filter-prop-list", function() {
  it('should find "exact" matches from propList', function() {
    var propList = [
      "font-size",
      "margin",
      "!padding",
      "*border*",
      "*",
      "*y",
      "!*font*"
    ];
    var expected = "font-size,margin";
    expect(filterPropList.exact(propList).join()).toBe(expected);
  });

  it('should find "contain" matches from propList and reduce to string', function() {
    var propList = [
      "font-size",
      "*margin*",
      "!padding",
      "*border*",
      "*",
      "*y",
      "!*font*"
    ];
    var expected = "margin,border";
    expect(filterPropList.contain(propList).join()).toBe(expected);
  });

  it('should find "start" matches from propList and reduce to string', function() {
    var propList = [
      "font-size",
      "*margin*",
      "!padding",
      "border*",
      "*",
      "*y",
      "!*font*"
    ];
    var expected = "border";
    expect(filterPropList.startWith(propList).join()).toBe(expected);
  });

  it('should find "end" matches from propList and reduce to string', function() {
    var propList = [
      "font-size",
      "*margin*",
      "!padding",
      "border*",
      "*",
      "*y",
      "!*font*"
    ];
    var expected = "y";
    expect(filterPropList.endWith(propList).join()).toBe(expected);
  });

  it('should find "not" matches from propList and reduce to string', function() {
    var propList = [
      "font-size",
      "*margin*",
      "!padding",
      "border*",
      "*",
      "*y",
      "!*font*"
    ];
    var expected = "padding";
    expect(filterPropList.notExact(propList).join()).toBe(expected);
  });

  it('should find "not contain" matches from propList and reduce to string', function() {
    var propList = [
      "font-size",
      "*margin*",
      "!padding",
      "!border*",
      "*",
      "*y",
      "!*font*"
    ];
    var expected = "font";
    expect(filterPropList.notContain(propList).join()).toBe(expected);
  });

  it('should find "not start" matches from propList and reduce to string', function() {
    var propList = [
      "font-size",
      "*margin*",
      "!padding",
      "!border*",
      "*",
      "*y",
      "!*font*"
    ];
    var expected = "border";
    expect(filterPropList.notStartWith(propList).join()).toBe(expected);
  });

  it('should find "not end" matches from propList and reduce to string', function() {
    var propList = [
      "font-size",
      "*margin*",
      "!padding",
      "!border*",
      "*",
      "!*y",
      "!*font*"
    ];
    var expected = "y";
    expect(filterPropList.notEndWith(propList).join()).toBe(expected);
  });
});
