import { createPortal } from 'react-dom';
import styles from './Skeleton.module.css';

/** Loading fallback sized like PersonDetail. Announces loading through the persistent #live-status region. */
export default function Skeleton() {
  const liveRegion = document.getElementById('live-status');

  return (
    <>
      <div className={styles.skeleton} aria-busy="true" />
      {liveRegion && createPortal('Loading person details', liveRegion)}
    </>
  );
}
