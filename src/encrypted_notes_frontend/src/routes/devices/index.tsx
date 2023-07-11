import { Box } from '@chakra-ui/react';

import { Layout } from '../../components';

export const Devices = () => {
  return (
    <Layout>
      <Box p={6} overflowY={'auto'} maxHeight={'calc(100vh - 64px)'}>
        <h1>List of Devices</h1>
      </Box>
    </Layout>
  );
};
