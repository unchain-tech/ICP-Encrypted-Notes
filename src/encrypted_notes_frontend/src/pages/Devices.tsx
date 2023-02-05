import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { useLoginUser } from '../hooks/useLoginUser'
import type { Device } from '../types/data'
import Button from '../components/Button'
import Layout from '../components/Layout'

const Devices: FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { loginUser } = useLoginUser()
  const [devices, setDevices] = useState<Device[]>([])

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

  // デバイスを削除するイベントハンドラ
  const handleDeleteDevice = async (alias: string) => {
    alert(`Delete ${alias}?`);

    try {
      // デバイスの削除
      await loginUser?.actor.deleteDevice(alias)

      // デバイス一覧の再取得
      getDevices()
    } catch (err) {
      alert(`Error deleteDevice(): ${err}`)
    }
  }

  useEffect(() => {
    // ユーザー認証がされている場合、デバイス一覧を取得する
    try {
      isAuthenticated().then(() => {
        getDevices()
      })
    } catch (error) {
      alert(error)
      navigate("/")
    }
  }, [])

  return (
    <Layout>
      <span>Devices</span>
      <main className="p-4">
        <ul className="border rounded-lg max-w-lg">
          {devices?.map((device: Device, id: number) => (
            <li
              key={device[0]}
              className="border-b px-3 last:border-none flex items-center"
            >
              <code
                className="flex-1 py-5 font-mono"
              >
                {device[0]}
              </code>
              {/* 最初に登録されたデバイス以外にDELETEボタンを表示する */}
              {(window.localStorage.getItem('deviceAlias') === device[0])
                ? <span className="italic opacity-70 pr-3">this device</span>
                : < Button onClick={() => handleDeleteDevice(device[0])}>DELETE</Button>
              }
            </li>
          ))}
        </ul>
      </main>
    </Layout >
  )
}

export default Devices