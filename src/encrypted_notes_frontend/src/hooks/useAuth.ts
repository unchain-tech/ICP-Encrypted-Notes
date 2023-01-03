import { useCallback } from "react";
import { useNavigate } from "react-router-dom"
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";

import { canisterId as IICanisterID } from "../../../declarations/internet_identity_dev";
import { useLoginUser } from "./useLoginUser";

export const useAuth = () => {
  // 認証成功時にページをリダイレクトするために使用
  const navigate = useNavigate()
  const { setLoginUser } = useLoginUser()

  const login = useCallback(async () => {
    // アプリケーションが接続しているネットワークに応じて、
    // ユーザー認証に使用するInternet IdentityのURLを決定する

    console.log(`DFX_NETWORK: ${process.env.DFX_NETWORK}`)// TODO delete
    let iiUrl
    if (process.env.DFX_NETWORK == "local") {
      iiUrl = `http://localhost:4943?canisterId=${IICanisterID}`
    } else if (process.env.DFX_NETWORK === "ic") {
      iiUrl = "https://identity.ic0.app/#authorize"
    } else {
      iiUrl = `https://${IICanisterID}.dfinity.network`
    }

    // ログイン認証を実行
    const authClient = await AuthClient.create()
    authClient.login({
      identityProvider: iiUrl,
      // 認証に成功した時
      onSuccess: async () => {
        // 認証したユーザーの`identity`を取得
        const identity = authClient.getIdentity()

        // 認証したユーザーの`prinicpal`を取得
        const principal = identity.getPrincipal()
        setLoginUser(principal)

        // 取得した`identity`を使用して、ICと対話する`agent`を作成する
        const newAgent = new HttpAgent({ identity })
        if (process.env.DFX_NETWORD === "local") {
          newAgent.fetchRootKey()
        }

        // ページリダイレクトをする
        navigate("/notes")
      },
      // 認証に失敗した時
      onError: (error) => {
        console.log(`Login failed: ${error}`)
      }
    })
  }, [navigate, setLoginUser])
  return { login }
}