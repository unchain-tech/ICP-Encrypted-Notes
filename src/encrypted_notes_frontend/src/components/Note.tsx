import { FC } from 'react'

import Button from './Button'

type Props = {
  note: string | undefined
  buttonTitle: string
  handleChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleClick: () => void
}

const Note: FC<Props> = (props) => {
  const { note, buttonTitle, handleChange, handleClick } = props

  return (
    <>
      <main className="p-4">
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
      <Button onClick={handleClick}>{buttonTitle}</Button>
    </>
  )
}

export default Note;
