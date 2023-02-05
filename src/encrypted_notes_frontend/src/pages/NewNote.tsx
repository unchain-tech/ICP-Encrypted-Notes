import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { useLoginUser } from '../hooks/useLoginUser'
import Layout from '../components/Layout'
import Note from '../components/Note'

const NewNote: FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [note, setNote] = useState('')
  const { loginUser } = useLoginUser()

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(event.target.value)
  }

  const handleClick = async () => {
    const id = await loginUser?.actor.addNote(note)
    alert(`Note no.${id} added`)
    setNote('')
  }

  useEffect(() => {
    try {
      isAuthenticated()
    } catch (error) {
      alert(error)
      navigate("/")
    }
  }, [])

  return (
    <Layout>
      <span>New Note</span>
      <Note
        note={note}
        buttonTitle="ADD"
        handleChange={handleChange}
        handleClick={handleClick}
      />
    </Layout>
  )
}

export default NewNote