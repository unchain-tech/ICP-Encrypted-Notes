import { useCallback } from 'react';

import { useAuthContext } from './authContext';

export const useDeviceCheck = () => {
  const { auth } = useAuthContext();

  const isDeviceRemoved = useCallback(async () => {
    if (auth.status !== 'SYNCED') {
      return false;
    }
    const deviceAlias = await auth.actor.getDeviceAliases();
    return !deviceAlias.includes(auth.cryptoService.deviceAlias);
  }, [auth]);

  return { isDeviceRemoved };
};
