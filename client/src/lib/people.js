/**
 * @typedef {Object} Person
 * @property {string} id
 * @property {string} name
 * @property {string} role
 */

/** @type {Person[]} Clearly fictional sample data. Ids are strings, like URL params. */
export const PEOPLE = [
  { id: '1', name: 'Ada Example', role: 'Fictional engineer' },
  { id: '2', name: 'Linus Sample', role: 'Fictional maintainer' },
  { id: '3', name: 'Grace Demo', role: 'Fictional compiler author' },
  { id: '4', name: 'Alan Placeholder', role: 'Fictional mathematician' },
  { id: '5', name: 'Mary Mockup', role: 'Fictional designer' },
];

/**
 * Finds a person by id using strict equality.
 * @param {Person[]} people
 * @param {string | undefined} id
 * @returns {Person | undefined}
 */
export function findPersonById(people, id) {
  return people.find((p) => p.id === id);
}
