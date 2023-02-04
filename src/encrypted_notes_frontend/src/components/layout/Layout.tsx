import { memo, ReactNode, FC } from 'react'
import Sidebar from '../Sidebar';

type Props = {
  children: ReactNode;
}

const Layout: FC<Props> = memo((props) => {
  const { children } = props
  return (
    <div className="flex bg-gray-100 min-h-screen w-screen">
      <Sidebar />
      <main className="w-full p-4">{children}</main>
    </div>
  )
})

export default Layout;
