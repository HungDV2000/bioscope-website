/** CLI scripts (lang:sync, ct:sync) — skip DB push & onInit seeds. */
export function isPayloadScriptMode(): boolean {
  return process.env.PAYLOAD_MIGRATING === 'true'
}

export function isMissingDbTableError(err: unknown): boolean {
  const msg = String((err as Error)?.message ?? err)
  return /relation .* does not exist/i.test(msg)
}
