import { test } from "./index.js"

test("Summary", t => {
  t.comment(`total  ${t.total}`)
  t.comment(`failed ${t.failed}`)
})

test("Ensure that t.body contains expected output", t => {
 const expected = `# Sync test first
ok 1 - I passed! 01-01
ok 2 - 01-02
ok 3 - 01-03
ok 4 - plan(3)
# Async test second
ok 5 - 02-01
ok 6 - 02-02
ok 7 - 02-03
ok 8 - plan(3)
# Async test third
ok 9 - 03-01
ok 10 - 03-02
ok 11 - 03-03
ok 12 - plan(3)
# Sync test fourth
ok 13 - 04-01
ok 14 - pass it! 04-02
ok 15 - plan(2)
# Timeout test fifth
ok 16 - 05-01
ok 17 - 05-02
ok 18 - plan(2)
# Testing async code in a different file
ok 19
ok 20 - plan(1)
# Summary
# total  20
# failed 0
# t.body
`

  t.equal(t.body, expected)
  t.plan(1)
})
