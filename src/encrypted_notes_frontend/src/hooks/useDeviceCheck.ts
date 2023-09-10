import { useCallback } from 'react';

import { useAuthContext } from './authContext';

export const useDeviceCheck = () => {
  const { auth } = useAuthContext();

  const isDeviceRemoved = useCallback(async () => {
    if (auth.status !== 'SYNCED') {
      return false;
    }

    // バックエンドキャニスターからデバイスエイリアスを取得します。
    const deviceAlias = ['dummy'];
    // 自身のデバイスエイリアスが含まれていない場合は、デバイスが削除されたと判断します。
    return !deviceAlias.includes(auth.cryptoService.deviceAlias);
  }, [auth]);

  return { isDeviceRemoved };
};
