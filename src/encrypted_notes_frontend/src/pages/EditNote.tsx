import { FC, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { EncryptedNote } from '../../../declarations/encrypted_notes_backend/encrypted_notes_backend.did'
import { useAuth } from '../hooks/useAuth'
import { useLoginUser } from '../hooks/useLoginUser'
import Button from '../components/Button'
import Layout from '../components/Layout'
import Note from '../components/Note'

const EditNote: FC = () => {
  const params = useParams()
  const navigate = useNavigate()
  const { loginUser } = useLoginUser()
  const { isAuthenticated } = useAuth()
  const [noteId] = useState(Number(params.noteId))
  const [note, setNote] = useState<EncryptedNote>()

  const getNote = async () => {
    try {
      const userNote: EncryptedNote = await loginUser?.actor.getNote(BigInt(noteId))
      console.log(`getNote: ${userNote.id}`)
      setNote(userNote)
    } catch (error) {
      alert(`Error: ${error}`)
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (note === undefined) {
      return
    }
    setNote({
      id: BigInt(noteId),
      encrypted_text: event.target.value
    })
  }

  const handleClick = async () => {
    if (note === undefined) {
      return
    }
    try {
      await loginUser?.actor.updateNote(note.id, note.encrypted_text)
      setNote({
        id: BigInt(noteId),
        encrypted_text: note.encrypted_text
      })
      alert(`Save note.`)
    } catch (error) {
      alert(`Error: ${error}`)
    }
  }

  const handleClickDelete = async () => {
    if (note === undefined) {
      alert("Could not delete note. ")
      return
    }
    try {
      alert(`Delete note.`)
      await loginUser?.actor.deleteNote(note.id)
      navigate("/notes")
    } catch (error) {
      alert(`Error: ${error}`)
    }
  }

  useEffect(() => {
    try {
      isAuthenticated().then(() => {
        getNote()
      })
    } catch (error) {
      alert(error)
      navigate("/")
    }
  }, [])

  return (
    <Layout>
      <div className="flex flex-row justify-between">
        <span>Edit Note</span>
        <Button onClick={handleClickDelete}>DELETE</Button>
      </div>
      <Note
        note={note?.encrypted_text}
        buttonTitle="SAVE"
        handleChange={handleChange}
        handleClick={handleClick}
      />
    </Layout>
  )
}

export default EditNote;
