import { Box, SimpleGrid, useDisclosure } from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DeleteItemDialog, Layout } from '../../components';
import { DeviceCard } from '../../components/DeviceCard';
import { useDeviceCheck } from '../../hooks';
import { useAuthContext } from '../../hooks/authContext';

export const Devices: FC = () => {
  const { auth } = useAuthContext();
  const {
    isOpen: isOpenDeleteDialog,
    onOpen: onOpenDeleteDialog,
    onClose: onCloseDeleteDialog,
  } = useDisclosure();
  const navigate = useNavigate();
  const [deviceAliases, setDeviceAliases] = useState<string[]>([]);
  const [deleteAlias, setDeleteAlias] = useState<string | undefined>(undefined);

  useDeviceCheck();

  const openDeleteDialog = (alias: string) => {
    setDeleteAlias(alias);
    onOpenDeleteDialog();
  };

  const getDevices = async () => {
    if (auth.status !== 'SYNCED') {
      console.error(`CryptoService is not synced.`);
      return;
    }
    try {
      const deviceAliases = await auth.actor.getDeviceAliases();
      setDeviceAliases(deviceAliases);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteDevice = async () => {
    if (auth.status !== 'SYNCED') {
      console.error(`CryptoService is not synced.`);
      return;
    }
    try {
      await auth.actor.deleteDevice(deleteAlias);
    } catch (err) {
      console.error(err);
    } finally {
      onCloseDeleteDialog();
      await getDevices();
    }
  };

  useEffect(() => {
    if (auth.status === 'ANONYMOUS') {
      navigate('/');
    }
    if (auth.status === 'SYNCHRONIZING') {
      return;
    }
    (async () => {
      await getDevices();
    })();
  }, [auth]);

  if (auth.status === 'ANONYMOUS') {
    return null;
  }

  if (auth.status === 'SYNCHRONIZING') {
    return (
      <Layout>
        <Box p={6} overflowY={'auto'} maxHeight={'calc(100vh - 64px)'}>
          Loading...
        </Box>
      </Layout>
    );
  }

  return (
    <>
      <Layout>
        <Box p={6} overflowY={'auto'} maxHeight={'calc(100vh - 64px)'}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
            {deviceAliases.map((deviceAlias, index) => (
              <DeviceCard
                key={index}
                deviceAlias={deviceAlias}
                isCurrentDevice={deviceAlias === auth.cryptoService.deviceAlias}
                handleOpenDeleteDialog={openDeleteDialog}
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
