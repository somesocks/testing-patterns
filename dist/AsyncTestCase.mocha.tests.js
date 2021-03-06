"use strict";
/* eslint-env mocha */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Assert_1 = __importDefault(require("async-patterns/Assert"));
var Callbackify_1 = __importDefault(require("async-patterns/Callbackify"));
var Promisify_1 = __importDefault(require("async-patterns/Promisify"));
var Logging_1 = __importDefault(require("async-patterns/Logging"));
var ping_1 = __importDefault(require("ping"));
var AsyncTestCase_1 = __importDefault(require("./AsyncTestCase"));
var EmptyTest = AsyncTestCase_1.default()
    .describe('empty test works')
    .build();
var SetupTest = AsyncTestCase_1.default()
    .describe('test with setup works')
    .setup(function () { return 'setup'; })
    .verify(Assert_1.default(function (context) { return context.setup === 'setup'; }, 'bad setup'))
    .build();
var SampleTest = AsyncTestCase_1.default()
    .describe('sample test 1')
    .setup(function () { return ({ val: 1 }); })
    .prepare(function (setup) { return setup.val; })
    .execute(function (request) { return request + 1; })
    .verify(Assert_1.default(function (context) { return context.setup.val === 1; }, 'bad setup'), Assert_1.default(function (context) { return context.result === 2; }, 'bad result'))
    .teardown(Assert_1.default(function (context) { return context.setup.val === 1 && context.result === 2; }, 'bad teardown'))
    .build();
var PingTest = AsyncTestCase_1.default()
    .describe('can ping internet')
    .setup(
// build our setup
function () {
    var setup = {
        testHosts: ['google.com', 'microsoft.com', 'yahoo.com'],
    };
    return setup;
})
    .prepare(
// run test with first host
function (setup) {
    var host = setup.testHosts[0];
    return host;
})
    .execute(Promisify_1.default(function (next, host) { return ping_1.default.sys.probe(host, function (isAlive, error) { return next(error, isAlive); }); }))
    .verify(Logging_1.default(function (_a) {
    var request = _a.request, result = _a.result;
    return "ping result for " + request + ": " + result;
}), 
// verify no error was thrown
Assert_1.default(function (_a) {
    var error = _a.error;
    return error == null;
}, 'error was thrown'), 
// verify result is true
Assert_1.default(function (_a) {
    var request = _a.request, result = _a.result;
    return result === true;
}, function (_a) {
    var request = _a.request, result = _a.result;
    return "could not ping host " + request;
}))
    .teardown(
// nothing to teardown
function () { return null; })
    .build();
var TESTS = [
    EmptyTest,
    SetupTest,
    SampleTest,
    PingTest,
];
describe('AsyncTestCase', function () {
    TESTS.forEach(function (test, i) { return it(test.label || "test " + i, Callbackify_1.default(test)); });
});
