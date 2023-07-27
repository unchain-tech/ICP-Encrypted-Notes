import { ActorSubclass } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { _SERVICE } from '../../../declarations/encrypted_notes_backend/encrypted_notes_backend.did';
import { CryptoService } from '../lib/cryptoService';

export const useDeviceCheck = (
  actor: ActorSubclass<_SERVICE>,
  client: AuthClient,
  cryptoService: CryptoService,
) => {
  const navigate = useNavigate();

  useEffect(() => {
    // 1秒ごとにポーリングします。
    const intervalId = setInterval(async () => {
      console.log('Check device data...');
      if (!actor) {
        return;
      }

      const deviceAlias = await actor.getDeviceAliases();
      if (
        !deviceAlias.find(
          (deviceAlias) => deviceAlias === cryptoService.deviceAlias,
        )
      ) {
        console.log('Delete this device data.');

        // TODO: ログアウト処理を実装する
        // ・デバイスデータの削除
        // ・鍵の同期処理等で動作しているポーリング処理の停止
        // ・AuthClientのログアウト処理
        cryptoService.clearDeviceData();
        client.logout();
        navigate('/');
      }
    }, 1000);

    // クリーンアップ関数を返します。
    return () => {
      clearInterval(intervalId);
    };
  }, [actor, client, cryptoService]);
};
