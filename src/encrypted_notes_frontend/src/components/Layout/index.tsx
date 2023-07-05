import { Box, HStack } from '@chakra-ui/react';
import { FC } from 'react';

import Header from './Header';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <HStack spacing={80} alignItems={'start'}>
        <Navigation />
        <Box>{children}</Box>
      </HStack>
    </>
  );
};

export default Layout;
