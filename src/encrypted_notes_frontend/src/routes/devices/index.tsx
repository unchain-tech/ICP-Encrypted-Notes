import { Box, SimpleGrid, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';

import { DeleteItemDialog, Layout } from '../../components';
import { DeviceCard } from '../../components/DeviceCard';

export const Devices = () => {
  const {
    isOpen: isOpenDeleteDialog,
    onOpen: onOpenDeleteDialog,
    onClose: onCloseDeleteDialog,
  } = useDisclosure();
  const [devices, setDevices] = useState<
    { alias: string; isCurrentDevice: boolean }[]
  >([]);

  const deleteDevice = () => {
    console.log('delete device');
    onCloseDeleteDialog();
  };

  return (
    <>
      <Layout>
        <Box p={6} overflowY={'auto'} maxHeight={'calc(100vh - 64px)'}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
            {devices.map((device, index) => (
              <DeviceCard
                key={index}
                device={device}
                handleOpenDeleteDialog={onOpenDeleteDialog}
              />
            ))}
          </SimpleGrid>
        </Box>
      </Layout>

      <DeleteItemDialog
        isOpen={isOpenDeleteDialog}
        onClose={onCloseDeleteDialog}
        title={'Delete Device'}
        handleDeleteItem={deleteDevice}
      />
    </>
  );
};
