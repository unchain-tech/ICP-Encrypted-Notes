import { useCallback } from 'react';

import { useAuthContext } from './authContext';

export const useDeviceCheck = () => {
  const { auth } = useAuthContext();

  const isDeviceRemoved = useCallback(async () => {
    if (auth.status !== 'SYNCED') {
      return false;
    }

    // デバイスエイリアス一覧を取得して、自身のエイリアスが含まれているかを確認します。
    return false;
  }, [auth]);

  return { isDeviceRemoved };
};
