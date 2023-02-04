import { memo, FC, useState } from 'react'

import Layout from '../components/layout/Layout'
import Button from '../components/Button'
import TextInput from '../components/TextInput'

import { useLoginUser } from '../hooks/useLoginUser'

const NewNote: FC = memo(() => {
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

  return (
    <Layout>
      <span>New Note</span>
      <main className="p-4">
        {/* <TextInput text="" /> */}
        <textarea
          id="message"
          rows={4}
          className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Your message..."
          value={note}
          onChange={handleChange}
        >
        </textarea>
      </main>
      <Button onClick={handleClick}>ADD</Button>
    </Layout>
  )
})

export default NewNote