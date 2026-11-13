import { NavLink, Outlet } from 'react-router';
import styles from './People.module.css';

/**
 * Master-detail shell: person list on one side, routed detail on the other.
 * @param {{ people: import('../lib/people.js').Person[] }} props
 */
export default function People({ people }) {
  return (
    <section className={styles.layout}>
      <div>
        <h2>People</h2>
        <nav aria-label="People">
          <ul className={styles.list}>
            {people.map((person) => (
              <li key={person.id}>
                <NavLink
                  to={`/people/${person.id}`}
                  className={({ isActive }) => (isActive ? styles.active : styles.link)}
                >
                  {person.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div>
        <Outlet />
      </div>
    </section>
  );
}
