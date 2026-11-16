import { Fragment } from 'react';
import { NavLink, useParams } from 'react-router';
import { useForumMessages } from '../hooks/useForumMessages.js';
import styles from './Forum.module.css';

const CHANNELS = [
  { id: 'nasa', label: 'NASA' },
  { id: 'esports-tribunal', label: 'Esports Tribunal' },
  { id: 'notNasa', label: 'Not NASA' },
];

/** Forum page: channel switcher and the messages of the channel in the URL. */
export default function Forum() {
  const { channelId } = useParams();
  const { status, data, error, retry } = useForumMessages(channelId);

  return (
    <section className={styles.layout}>
      <h2>Forum</h2>
      <nav aria-label="Channels">
        <ul className={styles.channels}>
          {CHANNELS.map((channel) => (
            <li key={channel.id}>
              <NavLink
                to={`/forum/${channel.id}`}
                className={({ isActive }) => (isActive ? styles.active : styles.link)}
              >
                {channel.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div aria-live="polite" aria-busy={status === 'LOADING'}>
        {status === 'LOADING' && <p>Loading messages...</p>}
        {status === 'ERROR' && (
          <div role="alert">
            <p>Could not load messages: {error}</p>
            <button type="button" onClick={retry}>
              Retry
            </button>
          </div>
        )}
        {status === 'SUCCESS' && data.length === 0 && <p>No messages yet.</p>}
        {status === 'SUCCESS' && data.length > 0 && (
          <dl className={styles.messages}>
            {data.map((msg) => (
              <Fragment key={msg.id}>
                <dt className={styles.author}>{msg.author}</dt>
                <dd>{msg.text}</dd>
              </Fragment>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
