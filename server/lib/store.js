import { randomUUID } from 'node:crypto';

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} text
 * @property {string} author
 * @property {string} timestamp ISO 8601
 */

function seed(author, text, minutesAgo) {
  return {
    id: randomUUID(),
    text,
    author,
    timestamp: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
  };
}

/** @type {Map<string, Message[]>} In-memory store with clearly fictional messages. */
const channels = new Map([
  [
    'nasa',
    [
      seed('Ada Example', 'Fictional launch window opens tomorrow.', 30),
      seed('Linus Sample', 'Sample telemetry looks nominal.', 20),
      seed('Grace Demo', 'Demo crew briefing at noon.', 10),
    ],
  ],
  [
    'esports-tribunal',
    [
      seed('Alan Placeholder', 'Placeholder match starts at 8 PM.', 25),
      seed('Mary Mockup', 'Mockup bracket published.', 5),
    ],
  ],
  [
    'notNasa',
    [
      seed('Ada Example', 'This channel is clearly not about space.', 15),
      seed('Linus Sample', 'Sample chatter about sample things.', 8),
    ],
  ],
]);

/** @param {string} channelId @returns {Message[] | undefined} */
export function getMessages(channelId) {
  return channels.get(channelId);
}

/**
 * Creates a message in an existing channel. The server chooses id and timestamp.
 * @param {string} channelId
 * @param {{ text: string, author: string }} fields already validated
 * @returns {Message | undefined} undefined when the channel is unknown
 */
export function addMessage(channelId, { text, author }) {
  const list = channels.get(channelId);
  if (!list) return undefined;
  const message = { id: randomUUID(), text, author, timestamp: new Date().toISOString() };
  list.push(message);
  return message;
}
