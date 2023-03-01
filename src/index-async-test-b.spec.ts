import { test } from "./index.js"

await test("Testing async code in a different file", async t => {
  t.equal(await Promise.resolve("Hello"), "Hello")
  t.plan(1)
})
