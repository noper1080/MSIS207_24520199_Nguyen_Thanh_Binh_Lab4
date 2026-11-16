import { useEffect, useState } from 'react';

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} text
 * @property {string} author
 * @property {string} timestamp
 */

/**
 * Loads the messages of one channel. Cancels the in-flight request when the channel changes.
 * @param {string} channelId
 * @returns {{
 *   status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR',
 *   data: Message[],
 *   error: string | null,
 *   retry: () => void,
 * }}
 */
export function useForumMessages(channelId) {
  const [state, setState] = useState({ status: 'IDLE', data: [], error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'LOADING', data: [], error: null });

    async function load() {
      try {
        const url = `${import.meta.env.VITE_API_URL}/api/channels/${encodeURIComponent(channelId)}/messages`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const data = await res.json();
        if (controller.signal.aborted) return;
        setState({ status: 'SUCCESS', data, error: null });
      } catch (err) {
        if (err.name === 'AbortError' || controller.signal.aborted) return;
        setState({ status: 'ERROR', data: [], error: err.message });
      }
    }

    load();
    return () => controller.abort();
  }, [channelId, attempt]);

  return { ...state, retry: () => setAttempt((n) => n + 1) };
}
