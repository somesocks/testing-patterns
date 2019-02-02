/* eslint-env mocha */

/* eslint-disable es5/no-destructuring */
/* eslint-disable es5/no-block-scoping */
/* eslint-disable es5/no-shorthand-properties */
/* eslint-disable es5/no-arrow-expression */
/* eslint-disable es5/no-arrow-functions */
/* eslint-disable es5/no-rest-parameters */
/* eslint-disable es5/no-spread */
/* eslint-disable es5/no-template-literals */
/* eslint-disable es5/no-es6-methods */

const Assert = require('callback-patterns/Assert');

const ping = require('ping');

const AssertionTest = require('./AssertionTest');


const EmptyTest = AssertionTest()
	.describe('empty test works')
	.build();

const SetupTest = AssertionTest()
	.describe('test with setup works')
	.setup(
		(next, context) => next(null, 'setup')
	)
	.verify(
		(next, context) => next(context.setup === 'setup' ? null : new Error('bad setup'))
	)
	.build();

const SampleTest = AssertionTest()
	.describe('sample test 1')
	.setup(
		(next, context) => next(null, { val: 1 })
	)
	.prepare(
		(next, setup) => next(null, setup.val)
	)
	.execute(
		(next, request) => next(null, request + 1)
	)
	.verify(
		Assert(
			(context) => context.setup.val === 1,
			'bad setup'
		),
		Assert(
			(context) => context.result === 2,
			'bad result'
		)
	)
	.teardown(
		Assert(
			(context) => context.setup.val === 1 && context.result === 2,
			'bad teardown'
		)
	)
	.build();

const PingTest = AssertionTest()
	.describe('can ping google')
	.tag('ping', 'network')
	.prepare(
		(next) => next(null, 'google.com')
	)
	.execute(
		(next, host) => ping.sys.probe(
			host,
			(isAlive, error) => next(error, isAlive)
		)
	)
	.verify(
		AssertionTest.VerifyErrorWasNotThrown,
		(next, context) => next(null, context.result === true)
	)
	.build();


const TESTS = [
	EmptyTest,
	SetupTest,
	SampleTest,
	PingTest,
];

describe('AssertionTest', () => {

	TESTS.forEach(
		(test) => it(test.label, test)
	);

});
