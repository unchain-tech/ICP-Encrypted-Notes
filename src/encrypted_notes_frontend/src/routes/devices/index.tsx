import { Box, SimpleGrid, useDisclosure } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DeleteItemDialog, DeviceCard, Layout } from '../../components';
import { useDeviceCheck, useMessage } from '../../hooks';
import { useAuthContext } from '../../hooks/authContext';

export const Devices = () => {
  const {
    isOpen: isOpenDeleteDialog,
    onOpen: onOpenDeleteDialog,
    onClose: onCloseDeleteDialog,
  } = useDisclosure();
  const navigate = useNavigate();

  const { auth, logout } = useAuthContext();
  const { isDeviceRemoved } = useDeviceCheck();
  const { showMessage } = useMessage();

  const [deviceAliases, setDeviceAliases] = useState<string[]>([]);
  const [deleteAlias, setDeleteAlias] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

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
      showMessage({
        title: 'Failed to get devices',
        status: 'error',
      });
    }
  };

  const deleteDevice = async () => {
    if (auth.status !== 'SYNCED') {
      console.error(`CryptoService is not synced.`);
      return;
    }
    setIsLoading(true);
    try {
      await auth.actor.deleteDevice(deleteAlias);
      await getDevices();
    } catch (err) {
      console.error(err);
      showMessage({
        title: 'Failed to delete device',
        status: 'error',
      });
    } finally {
      onCloseDeleteDialog();
      setIsLoading(false);
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

  useEffect(() => {
    // 1秒ごとにポーリングします。
    const intervalId = setInterval(async () => {
      console.log('Check device data...');

      const isRemoved = await isDeviceRemoved();
      if (isRemoved) {
        try {
          await logout();
          showMessage({
            title: 'This device has been deleted.',
            status: 'info',
          });
          navigate('/');
        } catch (err) {
          showMessage({ title: 'Failed to logout', status: 'error' });
          console.error(err);
        }
      }
    }, 1000);

    // クリーンアップ関数を返します。
    return () => {
      clearInterval(intervalId);
    };
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
        isLoading={isLoading}
        isOpen={isOpenDeleteDialog}
        onClose={onCloseDeleteDialog}
        title={'Delete Device'}
        handleDeleteItem={deleteDevice}
      />
    </>
  );
};
