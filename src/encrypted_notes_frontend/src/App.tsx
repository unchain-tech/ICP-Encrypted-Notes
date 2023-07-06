import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Devices, Home, Notes } from './routes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={'/'} element={<Home />} />
        <Route path={'/notes'} element={<Notes />} />
        <Route path={'/devices'} element={<Devices />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
