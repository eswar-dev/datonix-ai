import type { TwinEntity } from "@/domains/aec/data/meridian";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Resolve MG / MA / ME / MC (or org UUID) to entity code for API writes. */
export function resolveEntityCode(
  value: unknown,
  twinEntities: TwinEntity[] = [],
): string | undefined {
  if (value == null) return undefined;
  const raw = String(value).trim();
  if (!raw) return undefined;

  const byCode = twinEntities.find((e) => e.code.toUpperCase() === raw.toUpperCase());
  if (byCode) return byCode.code;

  if (UUID_RE.test(raw)) {
    const byId = twinEntities.find((e) => e.id === raw);
    if (byId?.code) return byId.code;
    return undefined;
  }

  if (raw.length <= 12 && !/\s/.test(raw)) return raw.toUpperCase();

  const byName = twinEntities.find((e) => e.name.toLowerCase() === raw.toLowerCase());
  return byName?.code;
}

/**
 * AEC write APIs expect `entity` (org code). Strip legacy `entityId` from outbound JSON.
 */
export function normalizeEntityRequestBody(
  body: Record<string, unknown>,
  twinEntities: TwinEntity[] = [],
): Record<string, unknown> {
  const next = { ...body };
  const code =
    resolveEntityCode(next.entity, twinEntities) ??
    resolveEntityCode(next.entityId, twinEntities);

  delete next.entityId;
  if (code) next.entity = code;
  else if ("entity" in next && (next.entity == null || next.entity === "")) delete next.entity;

  return next;
}
