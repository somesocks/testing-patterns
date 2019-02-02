# callback-patterns

`callback-patterns` is a collection of design patterns for callback-driven async code.  The design patterns in this library are constructors that build callback-expecting functions.  Each pattern is designed to be a stand-alone piece of code, tested for performance and robustness.

## Design

There is one major difference between this package and many other callback-driven async libraries: **the callback comes first**.

```javascript

// this
function task(callback, arg1, arg2, ...) { }

// not this
function task(arg1, arg2, ..., callback) { }

```

This makes it easier to compose callback-driven functions in useful ways, with almost no boilerplate code.

## API

<a name="testing-patterns"></a>

## testing-patterns : <code>object</code>
**Kind**: global namespace  

* [testing-patterns](#testing-patterns) : <code>object</code>
    * [.AssertionTest](#testing-patterns.AssertionTest)
        * [new AssertionTest()](#new_testing-patterns.AssertionTest_new)
        * [assertionTest.describe(description)](#testing-patterns.AssertionTest+describe) ⇒ <code>AssertionTest</code>
        * [assertionTest.tag(...tags)](#testing-patterns.AssertionTest+tag) ⇒ <code>AssertionTest</code>
        * [assertionTest.setup(task)](#testing-patterns.AssertionTest+setup) ⇒ <code>AssertionTest</code>
        * [assertionTest.prepare(task)](#testing-patterns.AssertionTest+prepare) ⇒ <code>AssertionTest</code>
        * [assertionTest.execute(task)](#testing-patterns.AssertionTest+execute) ⇒ <code>AssertionTest</code>
        * [assertionTest.verify(...tasks)](#testing-patterns.AssertionTest+verify) ⇒ <code>AssertionTest</code>
        * [assertionTest.teardown(task)](#testing-patterns.AssertionTest+teardown) ⇒ <code>AssertionTest</code>
        * [assertionTest.build()](#testing-patterns.AssertionTest+build) ⇒ <code>function</code>


* * *

<a name="testing-patterns.AssertionTest"></a>

### testing-patterns.AssertionTest
**Kind**: static class of [<code>testing-patterns</code>](#testing-patterns)  

* [.AssertionTest](#testing-patterns.AssertionTest)
    * [new AssertionTest()](#new_testing-patterns.AssertionTest_new)
    * [assertionTest.describe(description)](#testing-patterns.AssertionTest+describe) ⇒ <code>AssertionTest</code>
    * [assertionTest.tag(...tags)](#testing-patterns.AssertionTest+tag) ⇒ <code>AssertionTest</code>
    * [assertionTest.setup(task)](#testing-patterns.AssertionTest+setup) ⇒ <code>AssertionTest</code>
    * [assertionTest.prepare(task)](#testing-patterns.AssertionTest+prepare) ⇒ <code>AssertionTest</code>
    * [assertionTest.execute(task)](#testing-patterns.AssertionTest+execute) ⇒ <code>AssertionTest</code>
    * [assertionTest.verify(...tasks)](#testing-patterns.AssertionTest+verify) ⇒ <code>AssertionTest</code>
    * [assertionTest.teardown(task)](#testing-patterns.AssertionTest+teardown) ⇒ <code>AssertionTest</code>
    * [assertionTest.build()](#testing-patterns.AssertionTest+build) ⇒ <code>function</code>


* * *

<a name="new_testing-patterns.AssertionTest_new"></a>

#### new AssertionTest()
```javascript

let ping = require('ping');
let AssertionTest = require('testing-patterns/AssertionTest');

const pingTest = AssertionTest()
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

 test( () => console.log('test done') );

```
Builds an async assertion task.  When called,


* * *

<a name="testing-patterns.AssertionTest+describe"></a>

#### assertionTest.describe(description) ⇒ <code>AssertionTest</code>
**Kind**: instance method of [<code>AssertionTest</code>](#testing-patterns.AssertionTest)  
**Returns**: <code>AssertionTest</code> - this  
**Params**

- description <code>string</code> - a string label describing the test case


* * *

<a name="testing-patterns.AssertionTest+tag"></a>

#### assertionTest.tag(...tags) ⇒ <code>AssertionTest</code>
**Kind**: instance method of [<code>AssertionTest</code>](#testing-patterns.AssertionTest)  
**Returns**: <code>AssertionTest</code> - this  
**Params**

- ...tags <code>string</code> - any number of tags to be appended to the label


* * *

<a name="testing-patterns.AssertionTest+setup"></a>

#### assertionTest.setup(task) ⇒ <code>AssertionTest</code>
**Kind**: instance method of [<code>AssertionTest</code>](#testing-patterns.AssertionTest)  
**Returns**: <code>AssertionTest</code> - this  
**Params**

- task <code>function</code> - a setup task function - should return a setup object


* * *

<a name="testing-patterns.AssertionTest+prepare"></a>

#### assertionTest.prepare(task) ⇒ <code>AssertionTest</code>
**Kind**: instance method of [<code>AssertionTest</code>](#testing-patterns.AssertionTest)  
**Returns**: <code>AssertionTest</code> - this  
**Params**

- task <code>function</code> - a prepare task function - should accept a context containing the setup, and return a request object to be given to the executing task


* * *

<a name="testing-patterns.AssertionTest+execute"></a>

#### assertionTest.execute(task) ⇒ <code>AssertionTest</code>
**Kind**: instance method of [<code>AssertionTest</code>](#testing-patterns.AssertionTest)  
**Returns**: <code>AssertionTest</code> - this  
**Params**

- task <code>function</code> - the task the test should execute, and capture results and errors from


* * *

<a name="testing-patterns.AssertionTest+verify"></a>

#### assertionTest.verify(...tasks) ⇒ <code>AssertionTest</code>
**Kind**: instance method of [<code>AssertionTest</code>](#testing-patterns.AssertionTest)  
**Returns**: <code>AssertionTest</code> - this  
**Params**

- ...tasks <code>function</code> - any number of verification tasks


* * *

<a name="testing-patterns.AssertionTest+teardown"></a>

#### assertionTest.teardown(task) ⇒ <code>AssertionTest</code>
**Kind**: instance method of [<code>AssertionTest</code>](#testing-patterns.AssertionTest)  
**Returns**: <code>AssertionTest</code> - this  
**Params**

- task <code>function</code> - a task to tear down the setup


* * *

<a name="testing-patterns.AssertionTest+build"></a>

#### assertionTest.build() ⇒ <code>function</code>
builds the test case function from the builder

**Kind**: instance method of [<code>AssertionTest</code>](#testing-patterns.AssertionTest)  
**Returns**: <code>function</code> - callback-expecting test function  

* * *

