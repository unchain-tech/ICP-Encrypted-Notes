import { memo, FC, useState } from 'react'

type Props = {
  text?: string;
}

const TextInput: FC<Props> = memo(({ text = "" }: Props) => {
  const [editText, setEditText] = useState(text)

  return (
    <textarea
      id="message"
      rows={4}
      className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
      placeholder="Your message..."
      value={editText}
      onChange={(e) => setEditText(e.target.value)}
    >
    </textarea>
  )
})

export default TextInput;
