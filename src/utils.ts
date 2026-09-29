/** Keys whose values are JSONB blobs — skip recursive key conversion. */
const PASS_THROUGH = new Set([
  'data', 'design', 'variables', 'filters', 'sections', 'theme',
  'steps', 'trigger', 'columns', 'links', 'dns_records', 'onboarding_state',
  'audience', 'params', 'default_header', 'default_footer', 'default_theme',
  'example_copy', 'trigger_attributes', 'template_attributes', 'capabilities',
  'onboarding', 'headers', 'tags',
]);

/**
 * The header for an endpoint that requires an Idempotency-Key. A call without
 * a key gets a fresh one, which the client's own retries reuse; pass a key
 * only to retry the same request yourself.
 */
export function idempotencyHeader(key?: string): Record<string, string> {
  return { 'Idempotency-Key': key ?? globalThis.crypto.randomUUID() };
}

export function camelToSnake(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

export function toSnakeBody(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeBody);
  if (typeof obj !== 'object') return obj;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const snakeKey = camelToSnake(key);
    result[snakeKey] = PASS_THROUGH.has(snakeKey) ? value : toSnakeBody(value);
  }
  return result;
}

export function toCamelBody(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelBody);
  if (typeof obj !== 'object') return obj;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const camelKey = snakeToCamel(key);
    result[camelKey] = PASS_THROUGH.has(key) ? value : toCamelBody(value);
  }
  return result;
}
