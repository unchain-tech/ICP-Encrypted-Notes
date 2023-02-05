import { FC, ReactNode } from 'react'

type Props = {
  children: ReactNode
  onClick?: () => void
}

const Button: FC<Props> = (props) => {
  const { children, onClick } = props

  return (
    <button
      className="bg-gray-500 hover:bg-gray-400 text-white rounded px-4 py-2"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button