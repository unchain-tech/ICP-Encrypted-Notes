import { memo, FC, ReactNode } from 'react'

type Props = {
  children: ReactNode
}

const Button: FC<Props> = memo((props) => {
  const { children } = props

  return (
    <button
      className="bg-gray-500 hover:bg-gray-400 text-white rounded px-4 py-2"
    >
      {children}
    </button>
  )
})

export default Button