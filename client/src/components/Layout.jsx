import { NavLink, Outlet } from 'react-router';
import styles from './Layout.module.css';

/** Shared layout: header with nav, main with the routed page, persistent live region. */
export default function Layout() {
  return (
    <>
      <header className={styles.header}>
        <h1>Lab 4</h1>
        <nav aria-label="Main">
          <ul className={styles.navList}>
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) => (isActive ? styles.active : styles.link)}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/people"
                className={({ isActive }) => (isActive ? styles.active : styles.link)}
              >
                People
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/forum/nasa"
                className={({ isActive }) => (isActive ? styles.active : styles.link)}
              >
                Forum
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) => (isActive ? styles.active : styles.link)}
              >
                About
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <div id="live-status" aria-live="polite" className={styles.visuallyHidden} />
    </>
  );
}
