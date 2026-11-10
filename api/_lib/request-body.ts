import type { VercelRequest } from '@vercel/node';

export type JsonObject = Record<string, unknown>;

export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Vercel parses req.body lazily and throws on the first read when the JSON is
// malformed. Reading it here keeps that out of a handler's generic 500 path.
// Returns null for a malformed body and for anything that is not a JSON
// object, so the caller can answer 400.
export function readJsonObjectBody(req: Pick<VercelRequest, 'body'>): JsonObject | null {
  let body: unknown;
  try {
    body = req.body;
  } catch {
    return null;
  }
  return isJsonObject(body) ? body : null;
}
