import { test } from "./index.js"
import { promisify } from "node:util"

test("Sync test first", t => {
  t.pass("I passed! 01-01")
  t.equal(9 * 3, 27, "01-02")
  t.notEqual(0, -0, "01-03")
  t.plan(3)
})

await test("Async test second", async t => {
  // @ts-ignore: The value 'null' cannot be used here.
  t.throws(() => null.f(), "02-01")
  t.doesNotThrow(() => null, "02-02")
  t.equal(await Promise.resolve(84 * 5), 420, "02-03")
  t.plan(3)
})

await test("Async test third", async t => {
  t.equal(await Promise.resolve(73), 73, "03-01")
  t.ok(20 === 5 * 4, "03-02")
  t.notOk(20 === 5 * 3, "03-03")
  t.plan(3)
})

test("Sync test fourth", t => {
  t.equal('a' + 'b', 'ab', "04-01")
  t.pass("pass it! 04-02")
  t.plan(2)
})

await test("Timeout test fifth", async t => {
  t.equal(typeof Date.now, "function", "05-01")

  const start = Date.now()
  const timeout = promisify(setTimeout)

  await timeout(100, () => undefined)

  const end = Date.now()

  t.ok(end - start > 99 && end - start < 103, "05-02")
  t.plan(2)
})
