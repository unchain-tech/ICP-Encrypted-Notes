import { FC, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { EncryptedNote } from '../../../declarations/encrypted_notes_backend/encrypted_notes_backend.did'
import { useAuth } from '../hooks/useAuth'
import { useLoginUser } from '../hooks/useLoginUser'
import Layout from '../components/Layout'

const Notes: FC = () => {
  const navigate = useNavigate()
  const { loginUser } = useLoginUser()
  const { isAuthenticated } = useAuth()
  const [notes, setNotes] = useState<EncryptedNote[]>([])

  const getNotes = async () => {
    if ((loginUser === null) || (loginUser.cryptoService === undefined)) {
      console.log(`Undefined loginUser`);
      return;
    }
    try {
      // ノート一覧を取得する
      const userNotes: EncryptedNote[] = await loginUser.actor.getNotes()
      const decryptedNotes = new Array<EncryptedNote>();
      for (const encryptedNote of userNotes) {
        console.log(`No. ${encryptedNote.id}: ${encryptedNote.encrypted_text}`);
        // ノートを復号する
        const decryptedNote = await loginUser.cryptoService.decryptNote(encryptedNote.encrypted_text);
        decryptedNotes.push({
          id: encryptedNote.id,
          encrypted_text: decryptedNote,
        });
      }
      setNotes(decryptedNotes)
    } catch (error) {
      alert(`Error getNotes(): ${error}`)
    }
  }

  useEffect(() => {
    // ユーザー認証がされている場合、ノート一覧を取得する
    try {
      isAuthenticated().then(() => {
        getNotes()
      })
    } catch (error) {
      alert(error)
      navigate("/")
    }
  }, [])

  if (notes.length === 0) {
    return (
      <Layout>
        <span>Your Notes</span>
        <main className="p-4">
          <p>Nothing is saved.</p>
        </main>
      </Layout>
    )
  }

  return (
    <Layout>
      <span>Your Notes</span>

      <main className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-7xl">
          {notes.map((note: EncryptedNote) => (
            <div
              className="p-4 rounded-md border border-base-300 bg-base hover:-translate-y-2 transition-transform truncate"
              key={`${note.id}${note.encrypted_text}`}
            >
              <Link to={`/notes/${note.id}`}>
                <div className="pointer-events-none">
                  <h2 className="text-lg font-bold mb-2 line-clamp-3">
                    <span className="text-gray-500">{note.encrypted_text}</span>
                  </h2>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  )
}

export default Notes