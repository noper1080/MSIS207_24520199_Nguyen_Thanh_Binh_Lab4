import { describe, expect, it } from 'vitest';
import { PEOPLE, findPersonById } from './people.js';

describe('findPersonById', () => {
  it('returns the person for an existing id', () => {
    expect(findPersonById(PEOPLE, '1')).toBe(PEOPLE[0]);
  });

  it('finds every seeded person', () => {
    for (const person of PEOPLE) {
      expect(findPersonById(PEOPLE, person.id)).toBe(person);
    }
  });

  it('returns undefined for an unknown id', () => {
    expect(findPersonById(PEOPLE, '999')).toBeUndefined();
  });

  it('returns undefined when the id is undefined', () => {
    expect(findPersonById(PEOPLE, undefined)).toBeUndefined();
  });

  it('does not match a number against a string id', () => {
    expect(findPersonById(PEOPLE, 1)).toBeUndefined();
  });

  it('returns undefined for an empty list', () => {
    expect(findPersonById([], '1')).toBeUndefined();
  });
});
