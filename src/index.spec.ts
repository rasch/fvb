import { test, T } from "./index.js"

// `FVB_TEST` must be set in order to test t.bail(). It causes t.bail()
// to throw instead of exit which allows for testing using a try..catch
// block.
process.env.FVB_TEST = "true"

// `failWrap` is a function to help unit test fvb's fail assertions.
// NOTE: `failWrap` includes an assertion that needs to be accounted
// for when using t.plan().
const failWrap = (t: T) => (n: number) => (fn: () => void) => {
  t.comment(
    `\x1b[1;32mNOTE: the following ${n > 1 ? `${n} ` : ""}` +
    `test${n > 1 ? "s" : ""} should fail\x1b[22;39m`
  )

  // Save `t.failed` state before running any `fail` assertions.
  const before = t.failed

  fn()

  const after = t.failed

  // Revert `t.failed` so the `fail` assertions don't cause failure
  // unless they are actually broken.
  t.failed = before

  t.equal(after - before, n, "verify the number of failed tests is correct")
}

test("test points with no descriptions provided", t => {
  t.equal(840 / 2, 420)
  t.equal("a" + "b", "ab")
  t.equal(9 * 3, 27)
  t.ok(20 === 5 * 4)
  t.pass()
  t.notOk(20 === 5 * 3)
  t.notEqual(0, -0)
  t.plan(7)

  const expected = `# test points with no descriptions provided
ok 1
ok 2
ok 3
ok 4
ok 5
ok 6
ok 7
ok 8 - plan(7)
`

  t.equal(t.body, expected, "verify t.body is correct")
  t.equal(t.total, 9, "ensure correct total assertion number")
  t.equal(t.current, 10, "ensure correct current assertion number")
  t.equal(t.failed, 0, "ensure correct test failed number")

  t.plan(12)
})

test("test points with descriptions", t => {
  t.equal(840 / 2, 420, "message for test 14")
  t.equal("a" + "b", "ab", "test 15\nwas given a multiline message")
  t.equal(9 * 3, 27, "I am 16!")
  t.ok(20 === 5 * 4, "hello from 17 👋")
  t.pass("18 is a PASS")
  t.notOk(20 === 5 * 3, "hello from test 19")
  t.notEqual(0, -0, "0 doesn't equal -0 unless Infinity equals -Infinity")
  t.plan(7)

  const expected = `# test points with no descriptions provided
ok 1
ok 2
ok 3
ok 4
ok 5
ok 6
ok 7
ok 8 - plan(7)
ok 9 - verify t.body is correct
ok 10 - ensure correct total assertion number
ok 11 - ensure correct current assertion number
ok 12 - ensure correct test failed number
ok 13 - plan(12)
# test points with descriptions
ok 14 - message for test 14
ok 15 - test 15 was given a multiline message
ok 16 - I am 16!
ok 17 - hello from 17 👋
ok 18 - 18 is a PASS
ok 19 - hello from test 19
ok 20 - 0 doesn't equal -0 unless Infinity equals -Infinity
ok 21 - plan(7)
`

  t.equal(t.body, expected, "verify t.body is correct")
  t.equal(t.total, 22, "ensure correct total assertion number")
  t.equal(t.current, 10, "ensure correct current assertion number")
  t.equal(t.failed, 0, "ensure correct test failed number")

  t.plan(12)
})

test("t.pass", t => {
  t.pass("==AAA==")
  t.pass("==BBB==")
  t.pass()
  t.pass(undefined)

  t.ok(
    /\nok \d+ - ==AAA==\nok \d+ - ==BBB==\nok \d+\nok \d+\n/.test(t.body),
    "verify t.body is correct"
  )

  t.plan(5)
})

test("t.fail", t => {
  failWrap(t)(4)(() => {
    t.fail("I failed!")
    t.fail("Hello\n world", "one", "one\ntwo")
    t.fail("How about an object?", {a: 1, b: 2}, {a: 1, b: 2, c: 3})
    t.fail(
      "What? Another Failure Test",
      (a: any) => a, (a: any) => (_: any) => a
    )
  })

  t.plan(5)
})

test("t.equal", t => {
  t.equal(
    42,
    42,
    "given two primitive values that are equal should pass"
  )

  t.equal(
    [42, 21],
    [42, 21],
    "given two values that are deeply equal should pass"
  )

  failWrap(t)(2)(() => {
    t.equal(
      41,
      42,
      "given two primitive values that are not equal should fail"
    )

    t.equal(
      [42, 19],
      [42, 21],
      "given two values that are not deeply equal should fail"
    )
  })

  t.plan(5)
})

test("t.notEqual", t => {
  t.notEqual(
    41,
    42,
    "given two primitive values that are not equal should pass"
  )

  t.notEqual(
    [42, 19],
    [42, 21],
    "given two values that are not deeply equal should pass"
  )

  failWrap(t)(2)(() => {
    t.notEqual(
      42,
      42,
      "given two primitive values that are equal should fail"
    )

    t.notEqual(
      [42, 21],
      [42, 21],
      "given two values that are deeply equal should fail"
    )
  })

  t.plan(5)
})

test("t.ok", t => {
  t.ok(true, "given true should pass")
  t.ok(!!"hello world", "given a string coerced to boolean should pass")

  failWrap(t)(2)(() => {
    t.ok(false, "given false should fail")
    t.ok(!!"", "given an empty string coerced to boolean should fail")
  })

  t.plan(5)
})

test("t.notOk", t => {
  t.notOk(false, "given false should pass")
  t.notOk(!!"", "given an empty string coerced to boolean should pass")

  failWrap(t)(2)(() => {
    t.notOk(true, "given true should fail")
    t.notOk(!!"hello world", "given a string coerced to boolean should fail")
  })

  t.plan(5)
})

test("t.bail", t => {
  try {
    t.bail("testing bail!")
  } catch(e) {
    const error = e instanceof Error ? e : new Error()
    t.equal(error.message, "BAIL")
    t.ok(/^Bail out! testing bail!$/m.test(t.body))
  }

  try {
    t.bail("testing bail with\na multiline reason!")
  } catch(e) {
    const error = e instanceof Error ? e : new Error()
    t.equal(error.message, "BAIL")
    t.ok(/^Bail out! testing bail with a multiline reason!$/m.test(t.body))
  }

  t.plan(4)
})

test("t.throws", t => {
  t.throws(
    () => { throw new Error("BOO") },
    "given a function that throws should pass"
  )

  failWrap(t)(1)(() => {
    t.throws(
      () => { return "hello" },
      "a simple function that returns a string should fail"
    )
  })

  t.plan(3)
})

test("t.doesNotThrow", t => {
  t.doesNotThrow(
    () => { return "hello" },
    "a simple function that returns a string should pass"
  )

  failWrap(t)(1)(() => {
    t.doesNotThrow(
      () => { throw new Error("BOO") },
      "given a function that throws should fail"
    )
  })

  t.plan(3)
})

test("t.comment", t => {
  t.comment("https://www.youtube.com/watch?v=Dbnm-0r3suM")
  t.comment("   https://www.youtube.com/watch?v=dN3wEdK_vxw   ")
  t.comment("hello world\nfoo bar baz")
  t.comment("   ")
  t.comment("")

const expected = `
# https://www.youtube.com/watch?v=Dbnm-0r3suM
# https://www.youtube.com/watch?v=dN3wEdK_vxw
# hello world
# foo bar baz
#
#
`

  t.ok(t.body.endsWith(expected), "verify t.body is correct")

  t.plan(1)
})
