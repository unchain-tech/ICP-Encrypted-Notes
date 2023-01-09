// デバイス一覧を取得するカスタムフック

import { useCallback, useState } from 'react'

import { useLoginUser } from './useLoginUser'
import type { Device } from '../types/data'

export const useDevices = () => {
  // 取得したデバイスデータを扱うステートフック
  const [devices, setDevices] = useState<Device[]>([])

  const { loginUser } = useLoginUser()

  const getDevices = async () => {
    try {
      // デバイス一覧を取得する
      console.log(`loginUser.identity: ${loginUser?.identity}`) // TODO: delete
      const res = await loginUser?.actor.getDevices()
      console.log(`getDevices: ${res?.length}`)
      setDevices(res)
    } catch (err) {
      alert(`Error getDevices(): ${err}`)
    }
  }

  const deleteDevice = async (alias: string) => {
    try {
      // デバイスの削除
      await loginUser?.actor.deleteDevice(alias)

      // デバイス一覧の再取得
      getDevices()
    } catch (err) {
      alert(`Error deleteDevice(): ${err}`)
    }
  }

  return { getDevices, deleteDevice, devices }
}