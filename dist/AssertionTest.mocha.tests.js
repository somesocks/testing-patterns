"use strict";
/* eslint-env mocha */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Assert_1 = __importDefault(require("callback-patterns/Assert"));
var ping_1 = __importDefault(require("ping"));
var AssertionTest_1 = __importDefault(require("./AssertionTest"));
var EmptyTest = AssertionTest_1.default()
    .describe('empty test works')
    .build();
var SetupTest = AssertionTest_1.default()
    .describe('test with setup works')
    .setup(function (next) { return next(null, 'setup'); })
    .verify(function (next, context) { return next(context.setup === 'setup' ? null : new Error('bad setup')); })
    .build();
var SampleTest = AssertionTest_1.default()
    .describe('sample test 1')
    .setup(function (next) { return next(null, { val: 1 }); })
    .prepare(function (next, setup) { return next(null, setup.val); })
    .execute(function (next, request) { return next(null, request + 1); })
    .verify(Assert_1.default(function (context) { return context.setup.val === 1; }, 'bad setup'), Assert_1.default(function (context) { return context.result === 2; }, 'bad result'))
    .teardown(Assert_1.default(function (context) { return context.setup.val === 1 && context.result === 2; }, 'bad teardown'))
    .build();
var PingTest = AssertionTest_1.default()
    .describe('can ping internet')
    .setup(
// build our setup
function (next) {
    var setup = {
        testHosts: ['google.com', 'microsoft.com', 'yahoo.com'],
    };
    next(null, setup);
})
    .prepare(
// run test with first host
function (next, setup) {
    var host = setup.testHosts[0];
    next(null, host);
})
    .execute(function (next, host) { return ping_1.default.sys.probe(host, function (isAlive, error) { return next(error, isAlive); }); })
    .verify(
// verify no error was thrown
function (next, _a) {
    var error = _a.error;
    return next(error);
}, 
// verify result is true
function (next, _a) {
    var request = _a.request, result = _a.result;
    return next(result !== true ? new Error("could not ping host " + request) : null);
})
    .teardown(
// nothing to teardown
function (next) { return next(); })
    .build();
var TESTS = [
    EmptyTest,
    SetupTest,
    SampleTest,
    PingTest,
];
describe('AssertionTest', function () {
    TESTS.forEach(function (test, i) { return it(test.label || "test " + i, test); });
});
