import { FC, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { EncryptedNote } from '../../../declarations/encrypted_notes_backend/encrypted_notes_backend.did'
import { useAuth } from '../hooks/useAuth'
import { useLoginUser } from '../hooks/useLoginUser'
import Button from '../components/Button'
import Layout from '../components/Layout'
import Note from '../components/Note'

type decryptedNote = {
  id: bigint,
  note: string,
};

const EditNote: FC = () => {
  const params = useParams()
  const navigate = useNavigate()
  const { loginUser } = useLoginUser()
  const { isAuthenticated } = useAuth()
  const [noteId] = useState(Number(params.noteId))
  const [note, setNote] = useState<decryptedNote>()

  const getNote = async () => {
    if ((loginUser === null) || (loginUser.cryptoService === undefined)) {
      console.log(`Undefined loginUser`);
      return;
    }
    try {
      const userNote: EncryptedNote = await loginUser?.actor.getNote(BigInt(noteId))
      console.log(`getNote id: ${userNote.id}`)
      // ノートを復号する
      const decryptedNote = await loginUser.cryptoService.decryptNote(userNote.encrypted_text);

      setNote({ id: userNote.id, note: decryptedNote })
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
      note: event.target.value
    })
  }

  const handleClick = async () => {
    if (note === undefined) {
      return
    }
    if ((loginUser === null) || (loginUser.cryptoService === undefined)) {
      console.log(`Undefined loginUser`);
      return;
    }
    try {
      // ノートの暗号化を行う
      const encryptedNote = await loginUser.cryptoService.encryptNote(note.note);

      await loginUser.actor.updateNote(note.id, encryptedNote)
      setNote({
        id: BigInt(noteId),
        note: note.note
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
        note={note?.note}
        buttonTitle="SAVE"
        handleChange={handleChange}
        handleClick={handleClick}
      />
    </Layout>
  )
}

export default EditNote;
