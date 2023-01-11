import { v4 as uuidv4 } from 'uuid';

import { useLoginUser } from '../hooks/useLoginUser'

export const Crypto = () => {
  const { loginUser } = useLoginUser()

  const registerDevice = async () => {
    let deviceAlias = window.localStorage.getItem('deviceAlias')

    if (!deviceAlias) {
      // ローカルストレージに`deviceAlias`が保存されていなかった場合、新たに生成する
      deviceAlias = uuidv4()
      window.localStorage.setItem('deviceAlias', deviceAlias)
    }
    console.log(`deviceAlias: ${window.localStorage.getItem('deviceAlias')}`)

    // TODO 初期値ではなく、値を生成または取得する
    const publicKey = "TEST"

    try {
      // デバイスの登録
      await loginUser?.actor.registerDevice(deviceAlias, publicKey)
    } catch (err) {
      alert(`Error registerDevice(): ${err}`)
    }
  }

  return { registerDevice }
}