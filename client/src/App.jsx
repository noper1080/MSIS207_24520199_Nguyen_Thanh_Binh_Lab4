import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import Layout from './components/Layout.jsx';
import Skeleton from './components/Skeleton.jsx';

const PersonDetail = lazy(() => import('./pages/PersonDetail.jsx'));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<h2>Home</h2>} />
        <Route
          path="person"
          element={
            <Suspense fallback={<Skeleton />}>
              <PersonDetail />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
