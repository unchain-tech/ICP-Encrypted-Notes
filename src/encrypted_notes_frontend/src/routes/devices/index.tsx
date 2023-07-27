import { Box, SimpleGrid, useDisclosure } from '@chakra-ui/react';
import { ActorSubclass } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { FC, useEffect, useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import { _SERVICE } from '../../../../declarations/encrypted_notes_backend/encrypted_notes_backend.did';
import { DeleteItemDialog, Layout } from '../../components';
import { DeviceCard } from '../../components/DeviceCard';
import { useDeviceCheck } from '../../hooks';
import { CryptoService } from '../../lib/cryptoService';

interface DevicesProps {
  actor: ActorSubclass<_SERVICE>;
  client: AuthClient;
  cryptoService: CryptoService;
  checkAuthenticated: (navigate: NavigateFunction) => Promise<void>;
}

export const Devices: FC<DevicesProps> = ({
  actor,
  client,
  cryptoService,
  checkAuthenticated,
}) => {
  const {
    isOpen: isOpenDeleteDialog,
    onOpen: onOpenDeleteDialog,
    onClose: onCloseDeleteDialog,
  } = useDisclosure();
  const navigate = useNavigate();
  const [deviceAliases, setDeviceAliases] = useState<string[]>([]);
  const [deleteAlias, setDeleteAlias] = useState<string | undefined>(undefined);

  useDeviceCheck(actor, client, cryptoService);

  const openDeleteDialog = (alias: string) => {
    setDeleteAlias(alias);
    onOpenDeleteDialog();
  };

  const getDevices = async () => {
    try {
      const deviceAliases = await actor.getDeviceAliases();
      setDeviceAliases(deviceAliases);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteDevice = async () => {
    try {
      await actor.deleteDevice(deleteAlias);
    } catch (err) {
      console.error(err);
    } finally {
      onCloseDeleteDialog();
      await getDevices();
    }
  };

  useEffect(() => {
    checkAuthenticated(navigate);
  }, []);

  useEffect(() => {
    (async () => {
      if (actor) {
        await getDevices();
      }
    })();
  }, [actor, cryptoService]);

  if (cryptoService === undefined) {
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
                isCurrentDevice={deviceAlias === cryptoService.deviceAlias}
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
