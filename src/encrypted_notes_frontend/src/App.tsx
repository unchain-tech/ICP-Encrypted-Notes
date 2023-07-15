import { AuthClient } from '@dfinity/auth-client';
import { useState } from 'react';
import {
  BrowserRouter,
  NavigateFunction,
  Route,
  Routes,
} from 'react-router-dom';

import { Devices, Home, Notes } from './routes';

function App() {
  const [principal, setPrincipal] = useState(undefined);

  const handleSuccess = (
    authClient: AuthClient,
    navigate: NavigateFunction,
  ) => {
    // 認証したユーザーの`identity`を取得します。
    const identity = authClient.getIdentity();
    // 認証したユーザーの`principal`を取得します。
    const principal = identity.getPrincipal();
    console.log(`User principal: ${principal.toString()}`);

    setPrincipal(principal);

    // ノート一覧ページへリダイレクトします。
    navigate('/notes');
  };

  const login = async (navigate: NavigateFunction) => {
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
        console.error(`Login Failed: , ${error}`); // TODO: 認証失敗の通知を出す
      },
    });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path={'/'} element={<Home handleLogin={login} />} />
        <Route path={'/notes'} element={<Notes />} />
        <Route path={'/devices'} element={<Devices />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
