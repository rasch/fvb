# fvb

![fvb logo](/assets/logo.svg)

> a [TAP] producer for JavaScript unit testing

## getting started

Testing a **syncronous** function

```js
// add.spec.js

import { test } from "fvb"
import { add } from "./add.js"

test("Test add function", t => {
  t.equal(add(1, 2, 3, 4, 5, 6, 7), 28, "given multiple arguments")
  t.equal(add([1, 2, 3]), 6, "given an array")

  // t.plan is an OPTIONAL assertion that verifies the assertion count
  t.plan(2)
})
```

Running the test with `node`.js

```sh
node add.spec.js
```

## asyncronous example

Testing **async** functions

```js
// test-a.js

import { test } from "fvb"

test("Testing another async function in a different file", async t => {
  t.equal(await Promise.resolve(parseInt("1001001", 2)), 73)
  t.notEqual(await Promise.resolve(0), -0)
  t.plan(2)
})
```

Running the test

```sh
node test-a.js
```

When calling the `test` function multiple times in a single file and
testing async code, top-level await should be used for the tests to run
in order and for `t.plan` to work properly.

```js
// test-b.js

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
node test-b.js
```

Use top-level `await` to ensure that the `t.plan` method works and the
tests run in the expected order.

```js
// index.spec.js

await import("./test-a.js")
await import("./test-b.js")
```

Running the tests

```sh
node index.spec.js
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

## API

### `test(description, fn)`

```txt
test :: String -> (T -> Undefined) -> Promise(T)
```

The `test` method is the only function provided by `fvb`. It accepts a
string value for the test description as the first argument. The second
argument is a function that accepts a `T` interface as described in the
Assert section below. A Promise containing `T` is returned.

## Assert (`T`)

### `t.equal(actual, expected, [msg])`

```txt
t#equal :: a -> b -> (String | Undefined) -> Undefined
```

A [deep] equality assertion that checks if `actual` is equal to
`expected` using JavaScript's `Object.is` static method. `Setoid`
objects with an `equals` or `fantasy-land/equals` method are compared
using these methods.

### `t.notEqual(actual, expected, [msg])`

```txt
t#notEqual :: a -> b -> (String | Undefined) -> Undefined
```

This assertion is the same as the `t.equal` method except the values
compared are expected to be NOT equal.

### `t.ok(value, [msg])`

```txt
t#ok :: a -> (String | Undefined) -> Undefined
```

Pass if the given `value` is `true`.

### `t.notOk(value, [msg])`

```txt
t#notOk :: a -> (String | Undefined) -> Undefined
```

Pass if the given `value` is `false`.

### `t.throws(fn, [msg])`

```txt
t#throws :: (() -> Undefined) -> (String | Undefined) -> Undefined
```

Pass if the given `function` throws when called.

### `t.doesNotThrow(fn, [msg])`

```txt
t#doesNotThrow :: (() -> Undefined) -> (String | Undefined) -> Undefined
```

Pass if the given `function` does NOT throw when called.

### `t.plan(n)`

```txt
t#plan :: Integer -> Undefined
```

The `t.plan` module is NOT required. It is just another check that can
be used to help ensure all of the assertions ran. The integer given
should be a count of the assertions in the current `test` (excluding
the current t.plan call).

When using this method for testing asynchronous functions, be sure to
`await` any `async` calls before calling `t.plan`.

### `t.fail([msg], [actual], [expected])`

```txt
t#fail :: (String | Undefined) -> a -> b -> Undefined
```

An assertion that automatically fails. Useful as a helper to build
custom assertions.

### `t.pass([msg])`

```txt
t#pass :: (String | Undefined) -> Undefined
```

An assertion that automatically passes. Useful as a helper to build
custom assertions.

### `t.comment(msg)`

```txt
t#comment :: String -> Undefined
```

Print the given message as a comment in the TAP output.

### `t.bail([msg])`

```txt
t#bail :: (String | Undefined) -> Undefined
```

Bail out of the test! If the environment has a `process.exit` method
then it is called, otherwise an `Error` is thrown.

## .then(fn)

`test` returns a Promise containing `T`. This can be useful for creating
custom reporting and for using in the browser's `console`.

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
