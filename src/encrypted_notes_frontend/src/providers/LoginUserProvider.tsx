import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState
} from "react";
import { Principal } from "@dfinity/principal";

export type LoginUserContextType = {
  loginUser: Principal | null
  setLoginUser: Dispatch<SetStateAction<Principal | null>>
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
  const [loginUser, setLoginUser] = useState<Principal | null>(null)

  return (
    // グローバルに参照したい値を`value`に設定する
    <LoginUserContext.Provider value={{ loginUser, setLoginUser }}>
      {children}
    </LoginUserContext.Provider>
  )
}