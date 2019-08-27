
import Assert from 'async-patterns/Assert';
// import InSeries from 'async-patterns/InSeries';
// import InParallel from 'async-patterns/InParallel';
import InOrder from 'async-patterns/InOrder';
import CatchError from 'async-patterns/CatchError';
// import PassThrough from 'async-patterns/PassThrough';


// interface SyncFunction {
// 	(...args : any[]) : any;
// }

interface AsyncFunction {
	(...args : any[]) : Promise<any>;
	label ?: string,
}

interface SetupTask {
	() : any | Promise<any>
}

interface PrepareTask {
	(setup ?: any) : any | Promise<any>
}

interface ExecuteTask {
	(request ?: any) : any | Promise<any>
}

interface VerifyTask {
	(test : { setup ?: any, request ?: any, error ?: any, result ?: any }) : any | Promise<any>
}

interface TeardownTask {
	(test : { setup ?: any, request ?: any, error ?: any, result ?: any }) : any | Promise<any>
}

const DEFAULT_SETUP = function () {};

const DEFAULT_PREPARE= function (setup) {};

const DEFAULT_EXECUTE = function (request) {};

const DEFAULT_VERIFY = function (test) {
	if (test.error) {
		throw test.error;
	}
};

const DEFAULT_TEARDOWN = function (test) {
};

/**
*
* ```javascript
*
* const PingTest = AssertionTest()
*   .describe('can ping internet')
*   .setup(
*     // build our setup
*     (next) => {
*       const setup = {};
*       setup.testHosts = [ 'google.com', 'microsoft.com', 'yahoo.com' ];
*       next(null, setup);
*     }
*   )
*   .prepare(
*     // run test with first host
*     (next, setup) => {
*       const host = setup.testHosts[0];
*       next(null, host);
*     }
*   )
*   .execute(
*     (next, host) => ping.sys.probe(
*       host,
*       (isAlive, error) => next(error, isAlive)
*     )
*   )
*   .verify(
*     // verify no error was thrown
*     (next, { setup, request, result, error }) => next(error),
*     // verify result is true
*     (next, { setup, request, result, error }) => next(
*       result !== true ? new Error(`could not ping host ${request}`) : null
*     )
*   )
*   .teardown(
*     // nothing to teardown
*     (next, { setup, request, result, error }) => next()
*   )
*   .build();
*
*   test( () => console.log('test done') );
*
* ```
* Constructor for an AssertionTest builder.
*
* @name AsyncTestCase
* @class
* @constructor
* @memberof testing-patterns
*/
interface AsyncTestCase {

	/**
	*
	* `AssertionTest#describe` lets you set a description for a test case.
	* This description is part of the label attached to the test case when built.
	*
	* @function describe
	* @param {string} description - a string label describing the test case
	* @returns {AssertionTest} this
	* @memberof testing-patterns.AssertionTest#
	*/
	describe(description : string) : AsyncTestCase;

	/**
	*
	* `AssertionTest#setup` gives you a hook to build test fixtures before execution.
	* This is the first step that runs in a test.
	* `setup` is a separate step from `prepare` because you often want to use
	* a common setup function to build test fixtures for multiple tests.
	*
	* @function setup
	* @param {function} task - a setup task function - should return a setup object
	* @returns {AssertionTest} this
	* @memberof testing-patterns.AssertionTest#
	*/
	setup(setupTask : SetupTask) : AsyncTestCase;

	/**
	*
	* `AssertionTest#prepare` gives you a hook to prepare the request that the test uses to execute.
	* This is the second step that runs in a test, and the last step before `execute`.
	* The `prepare` task is passed the results from `setup`.
	*
	* @function prepare
	* @param {function} task - a prepare task function - should accept a context containing the setup, and return a request object to be given to the executing task
	* @returns {AssertionTest} this
	* @memberof testing-patterns.AssertionTest#
	*/
	prepare(prepareTask : PrepareTask) : AsyncTestCase;

	/**
	*
	* `AssertionTest#execute` lets you specify the task that is executed in a test.
	* The `execute` task is passed the results from `prepare`.
	*
	* @function execute
	* @param {function} task - the task the test should execute, and capture results and errors from
	* @returns {AssertionTest} this
	* @memberof testing-patterns.AssertionTest#
	*/
	execute(executeTask : ExecuteTask) : AsyncTestCase;

	/**
	*
	* `AssertionTest#verify` lets you specify any number of tasks to verify the test results.
	* Each `verify` task is passed a complete record of all test fixtures in an object,
	* including the setup, the request, the result, and the error (if an error was thrown)
	*
	* @function verify
	* @param {...function} tasks - any number of verification tasks
	* @returns {AssertionTest} this
	* @memberof testing-patterns.AssertionTest#
	*/
	verify(...verifyTasks : VerifyTask[]) : AsyncTestCase;

	/**
	*
	* `AssertionTest#teardown` gives you a hook to tear down the test fixtures after execution.
	* The `teardown` task is passed a complete record of all test fixtures in an object,
	* including the setup, the request, the result, and the error (if an error was thrown)
	*
	* @function teardown
	* @param {function} task - a task to tear down the setup
	* @returns {AssertionTest} this
	* @memberof testing-patterns.AssertionTest#
	*/
	teardown(teardownTask: TeardownTask) : AsyncTestCase;

	/**
	*
	* Builds the test case function.
	*
	* @function build
	* @returns {function} callback-expecting test function
	* @memberof testing-patterns.AssertionTest#
	*/
	build() : AsyncFunction;

}

function AsyncTestCaseImpl(this : AsyncTestCase | null | undefined | void) : AsyncTestCase {
	const self =
		this instanceof AsyncTestCaseImpl ?
		this : Object.create(AsyncTestCaseImpl.prototype);

	self._description = '';
	self._setup = DEFAULT_SETUP;
	self._prepare = DEFAULT_PREPARE;
	self._execute = DEFAULT_EXECUTE;
	self._verify = [ DEFAULT_VERIFY ];
	self._teardown = DEFAULT_TEARDOWN;

	return self;
}

/**
*
* `AssertionTest#describe` lets you set a description for a test case.
* This description is part of the label attached to the test case when built.
*
* @function describe
* @param {string} description - a string label describing the test case
* @returns {AssertionTest} this
* @memberof testing-patterns.AssertionTest#
*/
AsyncTestCaseImpl.prototype.describe = function describe(description) {
	this._description = description;
	return this;
};

/**
*
* `AssertionTest#setup` gives you a hook to build test fixtures before execution.
* This is the first step that runs in a test.
* `setup` is a separate step from `prepare` because you often want to use
* a common setup function to build test fixtures for multiple tests.
*
* @function setup
* @param {function} task - a setup task function - should return a setup object
* @returns {AssertionTest} this
* @memberof testing-patterns.AssertionTest#
*/
AsyncTestCaseImpl.prototype.setup = function setup(_setup : () => any) {
	this._setup = _setup;
	return this;
};

/**
*
* `AssertionTest#prepare` gives you a hook to prepare the request that the test uses to execute.
* This is the second step that runs in a test, and the last step before `execute`.
* The `prepare` task is passed the results from `setup`.
*
* @function prepare
* @param {function} task - a prepare task function - should accept a context containing the setup, and return a request object to be given to the executing task
* @returns {AssertionTest} this
* @memberof testing-patterns.AssertionTest#
*/
AsyncTestCaseImpl.prototype.prepare = function prepare(_prepare : (setup ?: any) => any) {
	this._prepare = _prepare;
	return this;
};

/**
*
* `AssertionTest#execute` lets you specify the task that is executed in a test.
* The `execute` task is passed the results from `prepare`.
*
* @function execute
* @param {function} task - the task the test should execute, and capture results and errors from
* @returns {AssertionTest} this
* @memberof testing-patterns.AssertionTest#
*/
AsyncTestCaseImpl.prototype.execute = function execute(_execute : (request ?: any) => any) {
	this._execute = _execute;
	return this;
};

/**
*
* `AssertionTest#verify` lets you specify any number of tasks to verify the test results.
* Each `verify` task is passed a complete record of all test fixtures in an object,
* including the setup, the request, the result, and the error (if an error was thrown)
*
* @function verify
* @param {...function} tasks - any number of verification tasks
* @returns {AssertionTest} this
* @memberof testing-patterns.AssertionTest#
*/
AsyncTestCaseImpl.prototype.verify = function verify(...args) {
	this._verify = args;
	return this;
};

/**
*
* `AssertionTest#teardown` gives you a hook to tear down the test fixtures after execution.
* The `teardown` task is passed a complete record of all test fixtures in an object,
* including the setup, the request, the result, and the error (if an error was thrown)
*
* @function teardown
* @param {function} task - a task to tear down the setup
* @returns {AssertionTest} this
* @memberof testing-patterns.AssertionTest#
*/
AsyncTestCaseImpl.prototype.teardown = function teardown(_teardown) {
	this._teardown = _teardown;
	return this;
};

/**
*
* Builds the test case function.
*
* @function build
* @returns {function} callback-expecting test function
* @memberof testing-patterns.AssertionTest#
*/
AsyncTestCaseImpl.prototype.build = function build(this : AsyncTestCaseImpl) {
	let {
		_setup,
		_prepare,
		_execute,
		_verify,
		_teardown,
		_description,
	} = this;

	_execute = CatchError(_execute);
	_verify = InOrder(..._verify);

	const test : AsyncFunction = async function () {
		const test : { setup ?: any, request ?: any, result ?: any, error ?: any } = {};

		test.setup = await _setup();
		test.request = await _prepare(test.setup);
		const { result, error } = await _execute(test.request);
		test.result = result;
		test.error = error;

		try {
			await _verify(test);
		} finally {
			await _teardown(test);
		}
	};

	test.label = _description;

	return test;
};

/**
* verifier function to make sure test DID NOT throw an error
* @function VerifyErrorWasNotThrown
* @memberof testing-patterns.AsyncTestCase
*/
AsyncTestCaseImpl.VerifyErrorWasNotThrown = Assert(
	function (context) { return context.error == null; },
	function (context) {
		return 'AsyncTestCase.VerifyErrorWasNotThrown: error was thrown ' + context.error.message
	}
);

/**
* verifier function to make sure test DID throw an error
* @function VerifyErrorWasNotThrown
* @memberof testing-patterns.AsyncTestCase
*/
AsyncTestCaseImpl.VerifyErrorWasThrown = Assert(
	function (context) { return context.error != null; },
	'AsyncTestCase.VerifyErrorWasThrown: error was not thrown'
);

export = AsyncTestCaseImpl;
