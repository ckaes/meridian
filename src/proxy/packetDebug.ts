/**
 * Full packet debug logging.
 *
 * Controlled by FULL_PROXY_DEBUG=1.
 * Logs COMPLETE, UNREDACTED request/response data to stderr.
 * Never enable in production — payloads contain full message content.
 */

export type PacketDirection = "CLIENT_READ" | "SERVER_WRITE" | "SERVER_READ" | "CLIENT_WRITE"

const isEnabled = (): boolean => Boolean(process.env.FULL_PROXY_DEBUG)

function safeStringify(data: unknown): string {
  const seen = new WeakSet()
  return JSON.stringify(data, (_key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "[Circular]"
      seen.add(value)
    }
    if (typeof value === "function") return `[Function: ${value.name || "anonymous"}]`
    return value
  }, 2)
}

export function packetDebug(
  requestId: string,
  direction: PacketDirection,
  data: unknown,
  label?: string,
): void {
  if (!isEnabled()) return

  const ts = new Date().toISOString()
  const suffix = label ? ` (${label})` : ""
  console.error(`[PROXY:PKT] ${ts} ${requestId} ${direction}${suffix}\n${safeStringify(data)}`)
}
