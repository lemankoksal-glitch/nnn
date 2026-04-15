/**
 * Contact search with three-tier resolution:
 *   1. Exact name match (case-insensitive)
 *   2. Partial / fuzzy name match → returns all candidates for the picker
 *   3. No match
 */
import type { WioContact } from "@/types";
import { looksLikeIBAN } from "./parse";

export type ContactSearchResult =
  | { kind: "exact"; contact: WioContact }
  | { kind: "partial"; matches: WioContact[] }
  | { kind: "iban"; iban: string; existingContact: WioContact | null }
  | { kind: "none"; query: string };

/**
 * Finds contacts matching a query string.
 *
 * Resolution order:
 *   - If query looks like an IBAN → search by IBAN, return iban result
 *   - Exact full-name match → "exact"
 *   - Any token in query matches any token in contact name → "partial"
 *   - Nothing → "none"
 */
export function findWioContact(
  query: string,
  contacts: WioContact[],
): ContactSearchResult {
  const q = query.trim();

  // ── IBAN path ────────────────────────────────────────────────────────────────
  if (looksLikeIBAN(q)) {
    const normalised = q.replace(/\s+/g, "").toUpperCase();
    const existing = contacts.find(
      (c) => c.iban?.replace(/\s+/g, "").toUpperCase() === normalised,
    );
    return { kind: "iban", iban: normalised, existingContact: existing ?? null };
  }

  // ── Name matching ────────────────────────────────────────────────────────────
  const qLower = q.toLowerCase();

  // 1. Exact full-name match
  const exact = contacts.find((c) => c.name.toLowerCase() === qLower);
  if (exact) return { kind: "exact", contact: exact };

  // 2. Any query token matches the start of any name token
  const queryTokens = qLower.split(/\s+/).filter(Boolean);
  const partial = contacts.filter((c) => {
    const nameTokens = c.name.toLowerCase().split(/\s+/);
    return queryTokens.some((qt) =>
      nameTokens.some((nt) => nt.startsWith(qt) && qt.length >= 2),
    );
  });

  if (partial.length === 1) return { kind: "exact", contact: partial[0] };
  if (partial.length > 1) return { kind: "partial", matches: partial };

  return { kind: "none", query: q };
}

/**
 * Look up a contact by ID.
 * Returns null if not found — callers must handle this.
 */
export function getContactById(
  id: string,
  contacts: WioContact[],
): WioContact | null {
  return contacts.find((c) => c.id === id) ?? null;
}

/**
 * Creates an ad-hoc WioContact from a name + IBAN supplied by the user.
 * Marked with id "adhoc_*" so the UI can distinguish it from stored contacts.
 */
export function buildAdhocContact(name: string, iban: string): WioContact {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  return {
    id: `adhoc_${Date.now()}`,
    name: name.trim(),
    iban: iban.replace(/\s+/g, "").toUpperCase(),
    isFavorite: false,
    avatarInitials: initials || "?",
    avatarColor: "bg-slate-400",
  };
}
