import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from './authContext';
import { useMessage } from './useMessage';

export const useDeviceCheck = () => {
  const navigate = useNavigate();
  const { auth, logout } = useAuthContext();
  const { showMessage } = useMessage();

  useEffect(() => {
    // 1秒ごとにポーリングします。
    const intervalId = setInterval(async () => {
      console.log('Check device data...');
      if (auth.status !== 'SYNCED') {
        return;
      }

      const deviceAlias = await auth.actor.getDeviceAliases();
      if (
        !deviceAlias.find(
          (deviceAlias) => deviceAlias === auth.cryptoService.deviceAlias,
        )
      ) {
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
};
