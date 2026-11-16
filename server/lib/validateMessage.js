export const TEXT_MAX = 500;
export const AUTHOR_MAX = 50;

/**
 * Validates a POST body. Whitelists text and author, ignores every other field.
 * @param {unknown} body
 * @returns {{ ok: true, value: { text: string, author: string } } | { ok: false, error: string }}
 */
export function validateMessage(body) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, error: 'Body must be a JSON object' };
  }

  const { text, author } = body;

  if (typeof text !== 'string') {
    return { ok: false, error: 'text must be a string' };
  }
  if (typeof author !== 'string') {
    return { ok: false, error: 'author must be a string' };
  }

  const trimmedText = text.trim();
  const trimmedAuthor = author.trim();

  if (trimmedText.length < 1 || trimmedText.length > TEXT_MAX) {
    return { ok: false, error: `text must be 1-${TEXT_MAX} characters` };
  }
  if (trimmedAuthor.length < 1 || trimmedAuthor.length > AUTHOR_MAX) {
    return { ok: false, error: `author must be 1-${AUTHOR_MAX} characters` };
  }

  return { ok: true, value: { text: trimmedText, author: trimmedAuthor } };
}
