import { FC, memo } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'

import Button from '../components/Button'
import Layout from '../components/layout/Layout'
import TextInput from '../components/TextInput'
import { Note } from '../types/data';

const notes: Note[] = [
  {
    id: 1,
    text: 'First text.',
  },
  {
    id: 2,
    text: 'Second text.',
  },
  {
    id: 3,
    text: 'Third text.',
  },
  {
    id: 4,
    text: 'aaaaaaaaaajlajsfiaiwejrngjvdksnbjvniaosjdfkawesdfaaaaaaaaaaaaaaa.',
  },
];

function getNote(id: number): Note | undefined {
  console.log(`id: ${id}`)
  const note = notes.find((e) => e.id === id);
  return note;
}

export const handleSaveNote = () => {
  alert('Push SAVE');
};

const Note: FC = memo(() => {
  const params = useParams()
  console.log(`param: ${params.noteId}`)

  const note = getNote(Number(params.noteId))
  console.log(note)


  // const { note } = props;
  return (
    <Layout>
      <span>Note no.{note?.id}</span>
      <main className="p-4">
        <TextInput text={note?.text} />
      </main>
      <Button>SAVE</Button>
    </Layout>
  )
})

export default Note;
