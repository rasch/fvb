# fvb

![fvb logo](/assets/logo.svg)

> a [TAP] producer for JavaScript unit testing

## getting started

Testing a **syncronous** function

```js
// test/test-add.js

import { test } from "fvb"
import { add } from "../src/add.js"

test("Test add function", t => {
  t.equal(add(1, 2, 3, 4, 5, 6, 7), 28, "given multiple arguments")
  t.equal(add([1, 2, 3]), 6, "given an array")

  // t.plan is an OPTIONAL assertion that verifies the assertion count
  t.plan(2)
})
```

Running the test with `node`.js

```sh
node ./test/test-add.js
```

## asyncronous example

Testing **async** functions

```js
// test/test-a.js

import { test } from "fvb"

test("Testing another async function in a different file", async t => {
  t.equal(await Promise.resolve(parseInt("1001001", 2)), 73)
  t.notEqual(await Promise.resolve(0), -0)
  t.plan(2)
})
```

Running the test

```sh
node ./test/test-a.js
```

When calling the `test` function multiple times in a single file and
testing async code, top-level await should be used for the tests to run
in order and for `t.plan` to work properly.

```js
// test/test-b.js

import { test } from "fvb"

await test("Testing async function", async t => {
  t.equal(await Promise.resolve("Hello"), "Hello")
  t.plan(1)
})

await test("Testing another async function", async t => {
  t.equal(await Promise.resolve(42), 42)
  t.plan(1)
})
```

Running the test

```sh
node ./test/test-b.js
```

Use top-level `await` to ensure that the `t.plan` method works and the
tests run in the expected order.

```js
// test/index.js

await import("./test-a.js")
await import("./test-b.js")
```

Running the tests

```sh
node ./test/index.js
```

## install

pnpm

```sh
pnpm add --save-dev fvb
```

npm

```sh
npm install --save-dev fvb
```

yarn

```sh
yarn add --dev fvb
```

## methods

### `test(description, fn)`

### `t.equal(actual, expected, [msg])`

### `t.notEqual(actual, expected, [msg])`

### `t.ok(value, [msg])`

### `t.notOk(value, [msg])`

### `t.throws(fn, expected, [msg])`

### `t.doesNotThrow(fn, expected, [msg])`

### `t.plan(n)`

### `t.fail([msg])`

### `t.pass([msg])`

### `t.comment([msg])`

### `t.bail([msg])`

## .then(fn)

### using in the browser

```js
import { test } from "https://cdn.skypack.dev/fvb"

const element = document.querySelector("#test-element")

test("Element exists", t => {
  t.notEqual(element, null, "#test-element should exist in document")
  t.plan(1)
})
.then(t => {
  console.log("TAP version 14")
  console.log(`1..${t.total}`)
  console.log(t.body)
})
```

## References & Alternatives

- <https://testanything.org/tap-version-14-specification.html>
- <https://github.com/ljharb/tape>
- <https://github.com/volument/baretest>
- <https://github.com/ericelliott/riteway>

[TAP]: https://testanything.org/
