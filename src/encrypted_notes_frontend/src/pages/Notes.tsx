import { memo, FC, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { Note } from '../types/data'
import Layout from '../components/layout/Layout'

import { useLoginUser } from '../hooks/useLoginUser'

const Notes: FC = memo(() => {
  const { loginUser } = useLoginUser()
  const [notes, setNotes] = useState<Note[]>([])

  const getNotes = async () => {
    try {
      const saveNotes = await loginUser?.actor.getNotes()
      setNotes(saveNotes)
    } catch (error) {
      alert(`${error}`)
    }
  }

  useEffect(() => {
    getNotes()
  })

  return (
    <Layout>
      <span>Your Notes</span>

      <main className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-7xl">
          {notes.map((note: Note) => (
            <div
              className="p-4 rounded-md border border-base-300 bg-base hover:-translate-y-2 transition-transform truncate"
              key={note.id}
            >
              <Link to={`/notes/${note.id}`}>
                <div className="pointer-events-none">
                  <h2 className="text-lg font-bold mb-2 line-clamp-3">
                    <span className="text-gray-500">{note.text}</span>
                  </h2>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  )
})

export default Notes