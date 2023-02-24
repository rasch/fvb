import { equals, inspect } from "eek-whales"

// ---------------------------------------------------------------------
// TAP Grammar
// ---------------------------------------------------------------------

interface TapDocument { (plan: string, body: string): string }
const tapDocument: TapDocument = (plan, body) =>
  `TAP version 14\n${plan}${body}`

interface Plan { (n: number, reason?: string): string }
const plan: Plan = (n, reason) =>
  `1..${n}${reason ? ` # ${reason.replace(/\n+/g, " ")}` : ""}\n`

interface TestPoint { (pass: boolean, n: number, description?: string): string }
const testPoint: TestPoint = (pass, n, description) =>
  `${pass ? "" : "not "}ok ${n}${description ? ` - ${description}` : ""}\n`

interface BailOut { (reason?: string): string }
const bailOut: BailOut = reason =>
  `Bail out!${reason ? ` ${reason}` : ""}\n`

interface Comment { (s: string): string }
const comment: Comment = s => `# ${s}\n`

interface YamlBlock { (actual: any, expected: any, e: Error): string }
const yamlBlock: YamlBlock = (actual, expected, e) => `  ---
  message:  ${e.message}
  actual:   ${inspect(actual)}
  expected: ${inspect(expected)}
  stack: |-
    ${e.stack?.trim()}
  ...\n`

// ---------------------------------------------------------------------
// Mr. T
// ---------------------------------------------------------------------

interface T {
  body: string
  total: number
  current: number
  failed: number
  pass: (msg?: string) => void
  fail: (msg?: string, actual?: any, expected?: any) => void
  equal: (actual: any, expected: any, msg?: string) => void
  notEqual: (actual: any, expected: any, msg?: string) => void
  plan: (n: number) => void
  ok: (actual: any, msg?: string) => void
  notOk: (actual: any, msg?: string) => void
  bail: (msg?: string) => void
  throws: (fn: () => void, msg?: string) => void
  doesNotThrow: (fn: () => void, msg?: string) => void
  comment: (msg: string) => void
}

const t: T = {
  // state
  body: "",
  total: 0,
  current: 0,
  failed: 0,

  pass: msg => {
    t.current++
    t.body += testPoint(true, ++t.total, msg)
  },

  fail: (msg, actual, expected) => {
    t.current++
    t.failed++
    t.body += testPoint(false, ++t.total, msg)
    try {
      throw new Error("Failed Test")
    } catch (e) {
      t.body += yamlBlock(
        actual,
        expected,
        e instanceof Error ? e : new Error()
      )
    }
  },

  equal: (actual, expected, msg) => equals(actual)(expected)
    ? t.pass(msg)
    : t.fail(msg, actual, expected),

  notEqual: (actual, expected, msg) => equals(actual)(expected)
    ? t.fail(msg, actual, expected)
    : t.pass(msg),

  plan: n => t.equal(t.current, n),

  ok: (actual, msg) => t.equal(actual, true, msg),

  notOk: (actual, msg) => t.equal(actual, false, msg),

  bail: msg => {
    t.body += bailOut(msg)
    if (typeof process === "object" && typeof process.exit === "function") {
      t.failed++
      process.exit()
    } else {
      throw new Error("BAIL")
    }
  },

  throws: (fn, msg) => {
    try {
      fn()
      t.fail(`${msg}: ${fn}`)
    } catch (e) {
      t.pass(`${msg}: ${fn}`)
    }
  },

  doesNotThrow: (fn, msg) => {
    try {
      fn()
      t.pass(`${msg}: ${fn}`)
    } catch (e) {
      t.fail(`${msg}: ${fn}`)
    }
  },

  comment: msg => { t.body += comment(msg) },
}

// ---------------------------------------------------------------------
// API
// ---------------------------------------------------------------------

interface Test { (description: string, fn: (assert: T) => void): Promise<T> }
export const test: Test = async (description, fn) => {
  t.current = 0
  t.body += comment(description)

  await Promise
  .resolve(fn(t))
  .catch(e => {
    t.fail(e.message, "Throws Due to Test Error", "Should Not Throw")
  })

  return t
}

// ---------------------------------------------------------------------
// Print Report
// ---------------------------------------------------------------------

interface ExitCode { (n: number): number }
const exitCode: ExitCode = n => n >= 0 && n < 255 ? ~~n : 255

if (typeof process === "object" && typeof process.exit === "function") {
  process.on("exit", () => {
    console.log(tapDocument(plan(t.total), t.body.trim()))
    process.exit(exitCode(t.failed))
  })
}
