import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";

import { canisterId as IICanisterId } from "../../../declarations/internet_identity_dev";
import {
  canisterId as BackendId,
  createActor
} from "../../../declarations/encrypted_notes_backend";
import { useLoginUser } from "./useLoginUser";
import { CryptoService } from '../lib/crypto'
import { sleep } from "../lib/sleep";
import { User } from "../types/data";

export const useAuth = () => {
  // 認証成功時にページをリダイレクトするために使用
  const navigate = useNavigate()
  const { loginUser, setLoginUser } = useLoginUser()

  const login = async () => {

    // アプリケーションが接続しているネットワークに応じて、
    // ユーザー認証に使用するInternet IdentityのURLを決定する

    console.log(`DFX_NETWORK: ${process.env.DFX_NETWORK}`)// TODO delete
    let iiUrl
    if (process.env.DFX_NETWORK == "local") {
      iiUrl = `http://localhost:4943?canisterId=${IICanisterId}`
    } else if (process.env.DFX_NETWORK === "ic") {
      iiUrl = "https://identity.ic0.app/#authorize"
    } else {
      iiUrl = `https://${IICanisterId}.dfinity.network`
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
        console.log(`login principal: ${principal}`) // TODO delete

        // 取得した`identity`を使用して、ICと対話する`agent`を作成する
        const newAgent = new HttpAgent({ identity })
        if (process.env.DFX_NETWORK === "local") {
          newAgent.fetchRootKey()
        }

        // identityを認証したユーザー情報でアクターを生成する
        const options = {
          agent: newAgent
        }
        const actor = createActor(BackendId, options)

        const loginUser: User = {
          identity: principal,
          actor: actor,
          status: "synchronizing",
        }

        setLoginUser(loginUser)

        // ===== クリプト関連の処理を実行 =====
        const cryptoService = new CryptoService(loginUser);
        const initialized
          = await cryptoService
            .init()
            .catch(
              (error) => console.log(`Could not initialize crypto service: ${error}`)
            )

        if (initialized) {
          console.log(`1== initialized: ${initialized}`); // TODO delete

          // ユーザー情報として`initialized`を登録する
          const loginUser: User = {
            identity: principal,
            actor: actor,
            status: "initialized",
          }

          setLoginUser(loginUser)
        } else {
          console.log(`2== initialized: ${initialized}`); // TODO delete

          // ユーザー情報として`synchronizing`を登録する
          const loginUser: User = {
            identity: principal,
            actor: actor,
            status: "synchronizing",
          }

          setLoginUser(loginUser)

          while (true) {
            await sleep(1000)
            try {
              const initialized = await cryptoService.pollForSynchronize()
              console.log(`3== initialized: ${initialized}`) //TODO delete

              // ユーザー情報として`initialized`を登録する
              if (initialized) {
                const loginUser: User = {
                  identity: principal,
                  actor: actor,
                  status: "synchronizing",
                }

                setLoginUser(loginUser)

                break
              }
            } catch (error) {
              alert("Could not check synchronization status")
              console.log(`Could not check synchronization status: ${error}`)
              return
            }
          }
        }

        // ページリダイレクトをする
        navigate("/newNote")
      },
      // 認証に失敗した時
      onError: (error) => {
        console.log(`Login failed: ${error}`)
      }
    })
  }

  // ユーザーがログイン認証済みかを確認
  const isAuthenticated = async () => {
    if (loginUser) {
      console.log("return");
      return;
    }
    console.log("Call isAuthenticated")
    try {
      const authClient = await AuthClient.create();
      const resultAuthenticated = await authClient.isAuthenticated();
      // 認証済みであればPrincipalを取得
      if (resultAuthenticated) {
        // 認証したユーザーの`identity`を取得
        const identity = authClient.getIdentity()

        // 認証したユーザーの`prinicpal`を取得
        const principal = identity.getPrincipal()

        console.log(`isAuthenticated principal: ${principal}`) // TODO delete
        // ICと対話する`agent`を作成する
        const newAgent = new HttpAgent({ identity });
        // ローカル環境の`agent`はICの公開鍵を持っていないため、`fetchRootKey()`で鍵を取得する
        if (process.env.DFX_NETWORK === "local") {
          newAgent.fetchRootKey();
        }

        // identityを認証したユーザー情報でアクターを生成する
        const options = {
          agent: newAgent
        }
        const actor = createActor(BackendId, options)

        setLoginUser({
          identity: principal,
          actor: actor,
          status: "initialized", // TODO: ここ問題ないかチェックする
        })
      } else {
        console.log(`isAuthenticated: ${resultAuthenticated}`);
      }
    } catch (error) {
      console.log(`checkClientIdentity: ${error}`);
    }
  }

  // ページがリロードされた時、以下の関数を実行
  // useEffect(() => {
  //   isAuthenticated()
  // }, [])
  return { login, isAuthenticated }
}

