import { ChakraProvider } from '@chakra-ui/react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { AuthContext, useAuthProvider } from './hooks/authContext';

const container = document.getElementById('app');
if (!container) {
  throw new Error('No container found');
}
const root = createRoot(container);

const AuthProvier = ({ children }) => {
  return (
    <AuthContext.Provider value={useAuthProvider()}>
      {children}
    </AuthContext.Provider>
  );
};

root.render(
  <ChakraProvider>
    <AuthProvier>
      <App />
    </AuthProvier>
  </ChakraProvider>,
);
