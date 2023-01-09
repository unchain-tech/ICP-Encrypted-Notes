import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState
} from "react";
import { Principal } from "@dfinity/principal";
import { User } from "../types/data";

export type LoginUserContextType = {
  loginUser: User | null
  setLoginUser: Dispatch<SetStateAction<User | null>>
}

// コンテキストを作成する
export const LoginUserContext = createContext<LoginUserContextType>(
  {} as LoginUserContextType
)

// ログインユーザー情報を保持するコンテキスト
export const LoginUserProvider = (props: {
  children: ReactNode
}) => {
  const { children } = props
  const [loginUser, setLoginUser] = useState<User | null>(null)

  // ユーザーのデータを取得するコンポーネントを呼び出す→useEffect内の実装が実行される

  return (
    // グローバルに参照したい値を`value`に設定する
    <LoginUserContext.Provider value={{ loginUser, setLoginUser }}>
      {children}
    </LoginUserContext.Provider>
  )
}