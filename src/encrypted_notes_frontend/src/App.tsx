import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import { Devices, Home, Notes } from './routes';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path={'/'} element={<Home />} />
          <Route path={'/notes'} element={<Notes />} />
          <Route path={'/devices'} element={<Devices />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
