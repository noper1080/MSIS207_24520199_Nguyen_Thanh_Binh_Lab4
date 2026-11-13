import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import Layout from './components/Layout.jsx';
import Skeleton from './components/Skeleton.jsx';
import About from './pages/About.jsx';
import Home from './pages/Home.jsx';

const PersonDetail = lazy(() => import('./pages/PersonDetail.jsx'));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route
          path="person"
          element={
            <Suspense fallback={<Skeleton />}>
              <PersonDetail />
            </Suspense>
          }
        />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  );
}
