import { Box, SimpleGrid, useDisclosure } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DeleteItemDialog, DeviceCard, Layout } from '../../components';
import { useDeviceCheck, useMessage } from '../../hooks';
import { useAuthContext } from '../../hooks/authContext';

export const Devices = () => {
  const { auth } = useAuthContext();
  const { showMessage } = useMessage();
  const {
    isOpen: isOpenDeleteDialog,
    onOpen: onOpenDeleteDialog,
    onClose: onCloseDeleteDialog,
  } = useDisclosure();
  const navigate = useNavigate();
  const [deviceAliases, setDeviceAliases] = useState<string[]>([]);
  const [deleteAlias, setDeleteAlias] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const deleteDevice = async () => {
    if (auth.status !== 'SYNCED') {
      console.error(`CryptoService is not synced.`);
      return;
    }
    setIsLoading(true);
    try {
      // デバイスを削除します。
      console.log('delete device');
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

  const getDevices = async () => {
    if (auth.status !== 'SYNCED') {
      console.error(`CryptoService is not synced.`);
      return;
    }

    try {
      // バックエンドキャニスターからデバイスエイリアス一覧を取得します。
      setDeviceAliases([]);
    } catch (err) {
      showMessage({
        title: 'Failed to get devices',
        status: 'error',
      });
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
