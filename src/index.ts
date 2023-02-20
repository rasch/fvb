import { equals } from "eek-whales"

// ---------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------

interface ExitCode { (n: number): number }
const exitCode: ExitCode = n => n >= 0 && n < 255 ? ~~n : 255

interface Fmt { (value: any): string }
const fmt: Fmt = value => Object.is(value, -0) ? "-0" : `${value}`

interface Msg {
  (message?: string, actual?: any, expected?: any, equal?: boolean): string
}
const msg: Msg = (message, actual, expected, equal) => {
  if (typeof message !== "undefined") {
    return message
  } else if (typeof actual !== "undefined" && typeof expected !== "undefined") {
    return `${fmt(actual)} ${equal ? "===" : "!=="} ${fmt(expected)}`
  } else {
    return ""
  }
}

// ---------------------------------------------------------------------
// TAP Grammar
// ---------------------------------------------------------------------

interface TapDocument { (version: string, plan: string, body: string): string }
const tapDocument: TapDocument = (version, plan, body) => 
  `${version}${plan}${body}`

interface Version { (n: number): string }
const version: Version = (n = 14) => `TAP version ${n}\n`

interface Plan { (n: number, reason?: string): string }
const plan: Plan = (n, reason) => 
  `1..${n}${reason ? ` # ${reason.replace(/\n+/g, " ")}` : ""}\n`

interface TestPoint { (pass: boolean, n: number, description: string): string }
const testPoint: TestPoint = (pass, n, description) =>
  `${pass ? "" : "not "}ok ${n} - ${description}\n`

interface BailOut { (reason?: string): string }
const bailOut: BailOut = reason => 
  `Bail out!${reason ? ` ${reason}` : ""}\n`

interface Comment { (s: string): string }
const comment: Comment = s => `# ${s}\n`

interface YamlBlock { (actual: any, expected: any, e: Error): string }
const yamlBlock: YamlBlock = (actual, expected, e) => `  ---
  message:  ${e.message}
  actual:   ${actual ? fmt(actual) : "N/A"}
  expected: ${expected ? fmt(expected) : "N/A"}
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
  pass: (message?: string, actual?: any, expected?: any, equal?: boolean) => void
  fail: (message?: string, actual?: any, expected?: any, equal?: boolean) => void
  equal: (actual: any, expected: any, message?: string) => void
  notEqual: (actual: any, expected: any, message?: string) => void
  plan: (n: number) => void
  ok: (actual: any, message?: string) => void
  notOk: (actual: any, message?: string) => void
  bail: (message?: string) => void
  throws: (fn: () => void, message?: string) => void
  doesNotThrow: (fn: () => void, message?: string) => void
  comment: (message: string) => void
}

const t: T = {
  // state
  body: "",
  total: 0,
  current: 0,
  failed: 0,
  
  pass: (message, actual, expected, equal) => {
    t.total++
    t.current++
    t.body += testPoint(true, t.total, msg(message, actual, expected, equal))
  },

  fail: (message, actual, expected, equal) => {
    t.total++
    t.current++
    t.failed++
    t.body += testPoint(false, t.total, msg(message, actual, expected, equal))
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
  
  equal: (actual, expected, message) =>
    (equals(actual)(expected) ? t.pass : t.fail)(message, actual, expected, true),
  
  notEqual: (actual, expected, message) =>
    (equals(actual)(expected) ? t.fail : t.pass)(message, actual, expected, false),

  plan: n => t.equal(t.current, n, `plan(${n}) === ${t.current}`),

  ok: (actual, message) => t.equal(actual, true, message),

  notOk: (actual, message) => t.equal(actual, false, message),
  
  bail: message => {
    t.body += bailOut(message)
    if (typeof process === "object" && typeof process.exit === "function") {
      t.failed++
      process.exit()
    } else {
      throw new Error("BAIL")
    }
  },
  
  throws: (fn, message) => {
    try {
      fn()
      t.fail(`${message}: ${fn}`)
    } catch (e) {
      t.pass(`${message}: ${fn}`)
    }
  },
  
  doesNotThrow: (fn, message) => {
    try {
      fn()
      t.pass(`${message}: ${fn}`)
    } catch (e) {
      t.fail(`${message}: ${fn}`)
    }
  },
  
  comment: message => { t.body += comment(message) },
}

// ---------------------------------------------------------------------
// API
// ---------------------------------------------------------------------

interface Test { (description: string, fn: (assert: T) => void): Promise<T> }
export const test: Test = async (description, fn) => {
  t.current = 0
  t.body += comment(description)

  try {
    fn(t)
  } catch (e) {
    t.fail(
      e instanceof Error ? e.message : "",
      "Throws Due to Test Error",
      "Should Not Throw"
    )
  }
  
  return t
}

// ---------------------------------------------------------------------
// Print Report
// ---------------------------------------------------------------------

if (typeof process === "object" && typeof process.exit === "function") {
  process.on("exit", () => {
    console.log(tapDocument(version(14), plan(t.total), t.body.trim()))
    process.exit(exitCode(t.failed))
  })
}
