import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validateMessage } from './validateMessage.js';

describe('validateMessage', () => {
  it('accepts a valid body', () => {
    const result = validateMessage({ text: 'Hello', author: 'Ada' });
    assert.deepEqual(result, { ok: true, value: { text: 'Hello', author: 'Ada' } });
  });

  it('trims surrounding spaces', () => {
    const result = validateMessage({ text: '  Hello  ', author: '  Ada ' });
    assert.deepEqual(result.value, { text: 'Hello', author: 'Ada' });
  });

  it('whitelists only text and author', () => {
    const body = JSON.parse(
      '{"text":"Hi","author":"Ada","id":"x","timestamp":"y","isAdmin":true,"__proto__":{"polluted":true}}',
    );
    const result = validateMessage(body);
    assert.equal(result.ok, true);
    assert.deepEqual(Object.keys(result.value).sort(), ['author', 'text']);
  });

  it('rejects bodies that are not plain objects', () => {
    for (const body of [null, undefined, [], 'text', 42]) {
      assert.equal(validateMessage(body).ok, false);
    }
  });

  it('rejects a missing text or author', () => {
    assert.equal(validateMessage({ author: 'Ada' }).ok, false);
    assert.equal(validateMessage({ text: 'Hello' }).ok, false);
  });

  it('rejects non-string text or author', () => {
    assert.equal(validateMessage({ text: 5, author: 'Ada' }).ok, false);
    assert.equal(validateMessage({ text: 'Hello', author: {} }).ok, false);
  });

  it('rejects empty or whitespace-only text or author', () => {
    assert.equal(validateMessage({ text: '', author: 'Ada' }).ok, false);
    assert.equal(validateMessage({ text: '   ', author: 'Ada' }).ok, false);
    assert.equal(validateMessage({ text: 'Hello', author: '   ' }).ok, false);
  });

  it('enforces the text limit of 500 characters', () => {
    assert.equal(validateMessage({ text: 'a'.repeat(500), author: 'Ada' }).ok, true);
    assert.equal(validateMessage({ text: 'a'.repeat(501), author: 'Ada' }).ok, false);
  });

  it('enforces the author limit of 50 characters', () => {
    assert.equal(validateMessage({ text: 'Hello', author: 'a'.repeat(50) }).ok, true);
    assert.equal(validateMessage({ text: 'Hello', author: 'a'.repeat(51) }).ok, false);
  });

  it('returns a non-empty error message on failure', () => {
    const result = validateMessage({ text: '', author: 'Ada' });
    assert.equal(result.ok, false);
    assert.equal(typeof result.error, 'string');
    assert.ok(result.error.length > 0);
  });
});
