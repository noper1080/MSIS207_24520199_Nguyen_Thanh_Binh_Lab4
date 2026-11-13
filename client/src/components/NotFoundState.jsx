import { Link } from 'react-router';

/** Shown when a requested entity does not exist. */
export default function NotFoundState() {
  return (
    <div role="alert">
      <p>Person not found.</p>
      <Link to="/people">Back to the list</Link>
    </div>
  );
}
