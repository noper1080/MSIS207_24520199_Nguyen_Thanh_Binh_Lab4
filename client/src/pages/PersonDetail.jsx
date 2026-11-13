import { Fragment } from 'react';
import styles from './PersonDetail.module.css';

const PERSON = {
  name: 'Ada Example',
  details: [
    { id: 'role', label: 'Role', value: 'Fictional engineer' },
    { id: 'email', label: 'Email', value: 'ada@example.com' },
  ],
};

/** Page-level detail view of one fictional person. Default export so it can be lazy-loaded. */
export default function PersonDetail() {
  return (
    <article className={styles.detail}>
      <h2>{PERSON.name}</h2>
      <dl>
        {PERSON.details.map((item) => (
          <Fragment key={item.id}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </Fragment>
        ))}
      </dl>
    </article>
  );
}
