import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import Layout from './components/Layout.jsx';
import Skeleton from './components/Skeleton.jsx';
import { PEOPLE } from './lib/people.js';
import About from './pages/About.jsx';
import Forum from './pages/Forum.jsx';
import Home from './pages/Home.jsx';
import People from './pages/People.jsx';

const PersonDetail = lazy(() => import('./pages/PersonDetail.jsx'));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="people" element={<People people={PEOPLE} />}>
          <Route index element={<p>Select a person from the list.</p>} />
          <Route
            path=":id"
            element={
              <Suspense fallback={<Skeleton />}>
                <PersonDetail people={PEOPLE} />
              </Suspense>
            }
          />
        </Route>
        <Route path="forum/:channelId" element={<Forum />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  );
}
