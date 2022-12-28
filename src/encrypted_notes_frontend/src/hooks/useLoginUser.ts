import { useContext } from 'react'

import {
  LoginUserContext,
  LoginUserContextType
} from '../providers/LoginUserProvider'

export const useLoginUser = (): LoginUserContextType =>
  // 引数に渡されたContext（グローバルな値）を参照する
  useContext(LoginUserContext)