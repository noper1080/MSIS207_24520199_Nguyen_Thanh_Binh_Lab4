import { Fragment } from 'react';
import { useParams } from 'react-router';
import NotFoundState from '../components/NotFoundState.jsx';
import { findPersonById } from '../lib/people.js';
import styles from './PersonDetail.module.css';

/**
 * Detail view of the person selected by the :id URL param. Default export so it can be lazy-loaded.
 * @param {{ people: import('../lib/people.js').Person[] }} props
 */
export default function PersonDetail({ people }) {
  const { id } = useParams();
  const person = findPersonById(people, id);

  if (!person) return <NotFoundState />;

  const details = [
    { key: 'name', label: 'Name', value: person.name },
    { key: 'role', label: 'Role', value: person.role },
  ];

  return (
    <article className={styles.detail}>
      <h2>{person.name}</h2>
      <dl>
        {details.map((item) => (
          <Fragment key={item.key}>
            <dt>{item.label}:</dt>
            <dd>{item.value}</dd>
          </Fragment>
        ))}
      </dl>
    </article>
  );
}
