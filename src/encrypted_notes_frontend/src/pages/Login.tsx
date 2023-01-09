import { memo, FC } from 'react'
import Button from '../components/Button'
import { useAuth } from '../hooks/useAuth'

const Login: FC = memo(() => {
  const { login } = useAuth()

  const handleClickLogin = () => login()

  return (
    <div className='w-full flex flex-col items-center justify-between'>
      <div>
        <h1 className='text-6xl lg:text-7xl xl:text-8xl mt-48 text-center'>
          Encrypted Note Taking
        </h1>
      </div>
      <div className='items-center mt-48'>
        <Button
          onClick={handleClickLogin}
        >
          Login with Internet Identity</Button>
      </div>
    </div>
  )
})

export default Login