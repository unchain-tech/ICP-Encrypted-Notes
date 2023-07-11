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
      <HStack alignItems={'start'}>
        <Navigation />
        <Box flex={1}>{children}</Box>
      </HStack>
    </>
  );
};

export default Layout;
