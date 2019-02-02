
var Assert = require('callback-patterns/Assert');
var InSeries = require('callback-patterns/InSeries');
var InParallel = require('callback-patterns/InParallel');
var InOrder = require('callback-patterns/InOrder');
var CatchError = require('callback-patterns/CatchError');
var PassThrough = require('callback-patterns/PassThrough');

var DEFAULT_SETUP = function (next, context) {
	next();
};

var DEFAULT_PREPARE = function (next, context) {
	next();
};

var DEFAULT_EXECUTE = function (next, request) {
	next();
};

var DEFAULT_VERIFY = function (next, context) {
	next(context.error);
};

var DEFAULT_TEARDOWN = function (next, context) {
	next();
};



/**
*
* ```javascript
*
* let ping = require('ping');
* let AssertionTest = require('testing-patterns/AssertionTest');
*
* const pingTest = AssertionTest()
*   .describe('can ping google')
*   .tag('ping', 'network')
*   .prepare(
*     (next) => next(null, 'google.com')
*   )
*   .execute(
*     (next, host) => ping.sys.probe(
*       host,
*       (isAlive, error) => next(error, isAlive)
*     )
*   )
*   .verify(
*     AssertionTest.VerifyErrorWasNotThrown,
*     (next, context) => next(null, context.result === true)
*   )
*   .build();
*
*  test( () => console.log('test done') );
*
* ```
* Constructor for an AssertionTest builder.
*
* @name AssertionTest
* @class
* @constructor
* @memberof testing-patterns
*/
function AssertionTest() {
	var self = this instanceof AssertionTest ? this : Object.create(AssertionTest.prototype);

	self._label = [ '' ];
	self._setup = DEFAULT_SETUP;
	self._prepare = DEFAULT_PREPARE;
	self._execute = DEFAULT_EXECUTE;
	self._verify = [ DEFAULT_VERIFY ];
	self._teardown = DEFAULT_TEARDOWN;

	return self;
}

/**
* @function describe
* @param {string} description - a string label describing the test case
* @returns {AssertionTest} this
* @memberof testing-patterns.AssertionTest#
*/
AssertionTest.prototype.describe = function describe(description) {
	this._label[0] = description;
	return this;
};

/**
* @function tag
* @param {...string} tags - any number of tags to be appended to the label
* @returns {AssertionTest} this
* @memberof testing-patterns.AssertionTest#
*/
AssertionTest.prototype.tag = function tag() {
	var tags = arguments;
	this._label.push.apply(this._label, tags);
	return this;
};

/**
* @function setup
* @param {function} task - a setup task function - should return a setup object
* @returns {AssertionTest} this
* @memberof testing-patterns.AssertionTest#
*/
AssertionTest.prototype.setup = function setup(_setup) {
	this._setup = _setup;
	return this;
};

/**
* @function prepare
* @param {function} task - a prepare task function - should accept a context containing the setup, and return a request object to be given to the executing task
* @returns {AssertionTest} this
* @memberof testing-patterns.AssertionTest#
*/
AssertionTest.prototype.prepare = function prepare(_prepare) {
	this._prepare = _prepare;
	return this;
};

/**
* @function execute
* @param {function} task - the task the test should execute, and capture results and errors from
* @returns {AssertionTest} this
* @memberof testing-patterns.AssertionTest#
*/
AssertionTest.prototype.execute = function execute(_execute) {
	this._execute = _execute;
	return this;
};

/**
* @function verify
* @param {...function} tasks - any number of verification tasks
* @returns {AssertionTest} this
* @memberof testing-patterns.AssertionTest#
*/
AssertionTest.prototype.verify = function verify() {
	var _verify = arguments;
	this._verify = _verify;
	return this;
};

/**
* @function teardown
* @param {function} task - a task to tear down the setup
* @returns {AssertionTest} this
* @memberof testing-patterns.AssertionTest#
*/
AssertionTest.prototype.teardown = function teardown(_teardown) {
	this._teardown = _teardown;
	return this;
};

/**
* builds the test case function from the builder
* @function build
* @returns {function} callback-expecting test function
* @memberof testing-patterns.AssertionTest#
*/
AssertionTest.prototype.build = function build() {
	var _setup = this._setup;
	var _prepare = this._prepare;
	var _execute = this._execute;
	var _verify = this._verify;
	var _teardown = this._teardown;
	var _label = this._label.join(' ');

	var _init = function (next, context) {
		next(null, context || {});
	};

	var _setupWrapper = InSeries(
		InParallel.Flatten(
			PassThrough,
			_setup
		),
		function (next, context, setup) {
			context.setup = setup;
			next(null, context);
		}
	);


	var _prepareWrapper = InSeries(
		InParallel.Flatten(
			PassThrough,
			function (next, context) { _prepare(next, context.setup); }
		),
		function (next, context, request) {
			context.request = request;
			next(null, context);
		}
	);


	var _executeWrapper = CatchError(
		InSeries(
			InParallel.Flatten(
				PassThrough,
				function (next, context) { _execute(next, context.request); }
			),
			function (next, context, result) {
				context.result = result;
				next();
			}
		)
	);

	_executeWrapper = InSeries(
		InParallel.Flatten(
			PassThrough,
			_executeWrapper
		),
		function (next, context, error) {
			context.error = error;
			next(null, context);
		}
	);

	var _verifyWrapper = InOrder.apply(null, _verify);

	var _teardownWrapper = InOrder(_teardown);

	var test = InSeries(
		_init,
		_setupWrapper,
		_prepareWrapper,
		_executeWrapper,
		_teardownWrapper,
		_verifyWrapper
	);

	test.label = _label;

	return test;
};

/**
* verifier function to make sure test DID NOT throw an error
* @function VerifyErrorWasNotThrown
* @memberof testing-patterns.AsyncTestCase
*/
AssertionTest.VerifyErrorWasNotThrown = Assert(
	function (context) { return context.error == null; },
	function (context) {
		return 'AssertionTest.VerifyErrorWasNotThrown: error was thrown ' + context.error.message
	}
);

/**
* verifier function to make sure test DID throw an error
* @function VerifyErrorWasNotThrown
* @memberof testing-patterns.AsyncTestCase
*/
AssertionTest.VerifyErrorWasThrown = Assert(
	function (context) { return context.error != null; },
	'AssertionTest.VerifyErrorWasThrown: error was not thrown'
);

module.exports = AssertionTest;
