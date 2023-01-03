import { FC, memo } from 'react'
import { Routes, Route } from 'react-router-dom'

import Devices from '../pages/Devices'
import Login from '../pages/Login'
import NewNote from '../pages/NewNote'
import Note from '../pages/Note'
import Notes from '../pages/Notes'
import Page404 from '../pages/Page404'

import { Device, Note as NoteType } from '../types/data'
import { LoginUserProvider } from '../providers/LoginUserProvider'

// TODO delete
const devices: Device[] = [
  {
    alias: 'device1',
    pubkey: 'PUB_KEY_1',
  },
  {
    alias: 'device2',
    pubkey: 'PUB_KEY_2',
  },
  {
    alias: 'device3',
    pubkey: 'PUB_KEY_3',
  },
];

// TODO deleteテストデータ
const notes: NoteType[] = [
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
    id: 5,
    text: 'aaaaaaaaaajlajsfiaiwejrngjvdksnbjvniaosjdfkawesdfaaaaaaaaaaaaaaa.',
  },
];

export const Router: FC = memo(() => {
  return (
    <LoginUserProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/notes" element={<Notes notes={notes} />} />
        <Route path="/notes/:noteId" element={<Note />} />
        <Route path="/newNote" element={<NewNote />} />
        <Route path="/devices" element={<Devices devices={devices} />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </LoginUserProvider>
  )
})