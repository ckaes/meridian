/**
 * Unit tests for packetDebug — pure function, verifies stderr output.
 */
import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test"
import { packetDebug } from "../proxy/packetDebug"

describe("packetDebug", () => {
  let errorSpy: ReturnType<typeof spyOn>

  beforeEach(() => {
    errorSpy = spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    errorSpy.mockRestore()
    delete process.env.FULL_PROXY_DEBUG
  })

  it("does nothing when FULL_PROXY_DEBUG is not set", () => {
    delete process.env.FULL_PROXY_DEBUG
    packetDebug("req-1", "CLIENT_READ", { foo: "bar" })
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it("logs to stderr when FULL_PROXY_DEBUG=1", () => {
    process.env.FULL_PROXY_DEBUG = "1"
    packetDebug("req-1", "CLIENT_READ", { foo: "bar" })
    expect(errorSpy).toHaveBeenCalledTimes(1)
    const output = errorSpy.mock.calls[0][0] as string
    expect(output).toContain("[PROXY:PKT]")
    expect(output).toContain("req-1")
    expect(output).toContain("CLIENT_READ")
    expect(output).toContain('"foo": "bar"')
  })

  it("includes the label when provided", () => {
    process.env.FULL_PROXY_DEBUG = "1"
    packetDebug("req-2", "SERVER_WRITE", {}, "streaming")
    const output = errorSpy.mock.calls[0][0] as string
    expect(output).toContain("(streaming)")
  })

  it("omits label suffix when not provided", () => {
    process.env.FULL_PROXY_DEBUG = "1"
    packetDebug("req-3", "SERVER_READ", {})
    const output = errorSpy.mock.calls[0][0] as string
    expect(output).not.toContain("(")
  })

  it("pretty-prints JSON data", () => {
    process.env.FULL_PROXY_DEBUG = "1"
    packetDebug("req-4", "CLIENT_WRITE", { a: 1, b: { c: 2 } })
    const output = errorSpy.mock.calls[0][0] as string
    // Pretty-printed JSON has newlines and indentation
    expect(output).toContain("{\n")
    expect(output).toContain('  "a": 1')
  })
})
