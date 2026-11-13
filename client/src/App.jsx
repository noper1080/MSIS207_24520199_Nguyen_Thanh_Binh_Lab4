import { Route, Routes } from 'react-router';
import Layout from './components/Layout.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<h2>Home</h2>} />
      </Route>
    </Routes>
  );
}
