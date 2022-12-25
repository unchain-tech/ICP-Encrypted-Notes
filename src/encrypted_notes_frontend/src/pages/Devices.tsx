import { memo, FC } from 'react'

import { Device } from '../types/data'
import Layout from '../components/layout/Layout'
import Button from '../components/Button'

type Props = {
  devices: Device[]
}

const Devices: FC<Props> = memo((props) => {
  const { devices } = props

  return (
    <Layout>
      <span>Devices</span>
      <main className="p-4">
        <ul className="border rounded-lg max-w-lg">
          {devices.map((device: Device) => (
            <li
              className="border-b px-3 last:border-none flex items-center"
              key={device.alias}
            >
              <code className="flex-1 py-5 font-mono">{device.alias}</code>
              <Button>DELETE</Button>
            </li>
          ))}
        </ul>
      </main>
    </Layout>
  )
})

export default Devices