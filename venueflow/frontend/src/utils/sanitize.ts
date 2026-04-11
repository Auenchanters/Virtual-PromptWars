/**
 * Defensive escape helper for any place we might render untrusted text.
 * React escapes text nodes by default, so this is belt-and-braces for
 * future code paths that touch Gemini/broadcast output directly.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Trims and caps user-supplied strings before sending them to the API,
 * giving a friendly client-side guardrail in addition to server validation.
 */
export function clampInput(input: string, maxLength: number): string {
  return input.trim().slice(0, maxLength);
}
