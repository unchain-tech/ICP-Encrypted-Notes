import { memo, FC, useEffect } from 'react'

import type { Device } from '../types/data'
import Layout from '../components/layout/Layout'
import Button from '../components/Button'
import { useDevices } from '../hooks/useDevices'

import { useAuth } from '../hooks/useAuth'
import { useLoginUser } from '../hooks/useLoginUser'

const DeviceManagement: FC = memo(() => {
  const { isAuthenticated } = useAuth()
  const { loginUser } = useLoginUser()
  const { getDevices, devices } = useDevices()

  // デバイスを削除するイベントハンドラ
  const handleDeleteDevice = async (alias: string) => {
    alert(`Delete ${alias}?`);

    // deleteDevice(alias)
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
    isAuthenticated().then(() => {
      getDevices()
    })
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
              {(id !== 0) &&
                < Button onClick={() => handleDeleteDevice(device[0])}>DELETE</Button>
              }
            </li>
          ))}
        </ul>
      </main>
    </Layout >
  )
})

export default DeviceManagement