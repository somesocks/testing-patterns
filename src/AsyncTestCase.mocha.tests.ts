/* eslint-env mocha */

import Assert from 'async-patterns/Assert';
import Callbackify from 'async-patterns/Callbackify';
import Promisify from 'async-patterns/Promisify';
import Logging from 'async-patterns/Logging';

import ping from 'ping';

import AsyncTestCase from './AsyncTestCase';


const EmptyTest = AsyncTestCase()
	.describe('empty test works')
	.build();

const SetupTest = AsyncTestCase()
	.describe('test with setup works')
	.setup(
		() => 'setup'
	)
	.verify(
		Assert(
			(context) => context.setup === 'setup',
			'bad setup'
		)
	)
	.build();

const SampleTest = AsyncTestCase()
	.describe('sample test 1')
	.setup(
		() => ({ val: 1 })
	)
	.prepare(
		(setup) => setup.val
	)
	.execute(
		(request) => request + 1
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

const PingTest = AsyncTestCase()
	.describe('can ping internet')
	.setup(
		// build our setup
		() => {
			const setup = {
				testHosts :  [ 'google.com', 'microsoft.com', 'yahoo.com' ],
			};

			return setup;
		}
	)
	.prepare(
		// run test with first host
		(setup) => {
			const host = setup.testHosts[0];
			return host;
		}
	)
	.execute(
		Promisify(
			(next, host) => ping.sys.probe(
				host,
				(isAlive, error) => next(error, isAlive)
			)
		)
	)
	.verify(
		Logging(
			({ request, result }) => `ping result for ${request}: ${result}`
		),
		// verify no error was thrown
		Assert(
			({ error }) => error == null,
			'error was thrown'
		),
		// verify result is true
		Assert(
			({ request, result }) => result === true,
			({ request, result }) => `could not ping host ${request}`
		),
	)
	.teardown(
		// nothing to teardown
		() => null
	)
	.build();


const TESTS = [
	EmptyTest,
	SetupTest,
	SampleTest,
	PingTest,
];

describe('AsyncTestCase', () => {

	TESTS.forEach(
		(test, i) => it(test.label || `test ${i}`, Callbackify(test))
	);

});
