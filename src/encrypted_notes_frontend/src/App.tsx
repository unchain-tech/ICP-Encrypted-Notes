import { HttpAgent } from '@dfinity/agent';
import type { ActorSubclass } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
// import type { Principal } from '@dfinity/principal';
import { useState } from 'react';
import {
  BrowserRouter,
  NavigateFunction,
  Route,
  Routes,
} from 'react-router-dom';

import {
  canisterId,
  createActor,
} from '../../declarations/encrypted_notes_backend';
import type { _SERVICE } from '../../declarations/encrypted_notes_backend/encrypted_notes_backend.did';
import { CryptoService } from './lib/cryptoService';
import { Devices, Home, Notes } from './routes';

function App() {
  // TODO: principalが不要であれば削除する
  // const [principal, setPrincipal] = useState<Principal>(undefined);
  const [actor, setActor] = useState<ActorSubclass<_SERVICE>>(undefined);
  const [client, setClient] = useState<AuthClient>(undefined);
  const [cryptoService, setCryptoService] = useState<CryptoService>(undefined);

  const handleSuccess = async (
    authClient: AuthClient,
    navigate: NavigateFunction,
  ) => {
    try {
      // 認証したユーザーの`identity`を取得します。
      const identity = authClient.getIdentity();
      // 認証したユーザーの`principal`を取得します。
      const principal = identity.getPrincipal();
      console.log(`User principal: ${principal.toString()}`);
      // 取得した`identity`を使用して、ICと対話する`agent`を作成します。
      const newAgent = new HttpAgent({ identity });
      if (process.env.DFX_NETWORK === 'local') {
        newAgent.fetchRootKey();
      }
      // 認証したユーザーの情報で`actor`を作成します。
      const options = { agent: newAgent };
      const actor = createActor(canisterId, options);

      const cryptoService = new CryptoService(actor);
      await cryptoService.init();

      // TODO:コンポーネントに渡すデータが複数ある場合、type Userとしてひとまとめにする
      // setPrincipal(principal);
      setActor(actor);
      setClient(authClient);
      setCryptoService(cryptoService);

      navigate('/notes');
    } catch (err) {
      console.error(`Authentication Failed: , ${err}`);
      // TODO: 認証失敗の通知を出す
    }
  };

  const authenticate = async (navigate: NavigateFunction) => {
    let iiUrl: string;
    if (process.env.DFX_NETWORK === 'local') {
      iiUrl = `http://${process.env.INTERNET_IDENTITY_CANISTER_ID}.localhost:4943`;
    } else if (process.env.DFX_NETWORK === 'ic') {
      iiUrl = `https://${process.env.INTERNET_IDENTITY_CANISTER_ID}.ic0.app`;
    } else {
      // 他の設定が利用できない場合はローカルを使用します。
      iiUrl = `http://${process.env.INTERNET_IDENTITY_CANISTER_ID}.localhost:4943`;
    }

    // ログイン認証を実行します。
    const authClient = await AuthClient.create();
    authClient.login({
      identityProvider: iiUrl,
      onSuccess: async () => {
        handleSuccess(authClient, navigate);
      },
      onError: (error) => {
        console.error(`Authentication Failed: , ${error}`); // TODO: 認証失敗の通知を出す
      },
    });
  };

  const checkAuthenticated = async (navigate: NavigateFunction) => {
    try {
      const authClient = await AuthClient.create();
      const isAuthenticated = await authClient.isAuthenticated();
      if (!isAuthenticated) {
        navigate('/');
        return;
      }

      const identity = authClient.getIdentity();
      const newAgent = new HttpAgent({ identity });
      if (process.env.DFX_NETWORK === 'local') {
        newAgent.fetchRootKey();
      }
      const options = { agent: newAgent };
      const actor = createActor(canisterId, options);

      const cryptoService = new CryptoService(actor);
      await cryptoService.init();

      setActor(actor);
      setClient(authClient);
      setCryptoService(cryptoService);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={'/'}
          element={<Home handleAuthentication={authenticate} />}
        />
        <Route
          path={'/notes'}
          element={
            <Notes
              actor={actor}
              client={client}
              cryptoService={cryptoService}
              checkAuthenticated={checkAuthenticated}
            />
          }
        />
        <Route
          path={'/devices'}
          element={
            <Devices
              actor={actor}
              client={client}
              cryptoService={cryptoService}
              checkAuthenticated={checkAuthenticated}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
