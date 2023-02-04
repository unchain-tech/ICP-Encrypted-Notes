import { FC, memo } from 'react'
import { Routes, Route } from 'react-router-dom'

import DeviceManagement from '../pages/DeviceManagement'
import Login from '../pages/Login'
import NewNote from '../pages/NewNote'
import Note from '../pages/Note'
import Notes from '../pages/Notes'
import Page404 from '../pages/Page404'

import type { Device, Note as NoteType } from '../types/data'
import { LoginUserProvider } from '../providers/LoginUserProvider'

export const Router: FC = memo(() => {
  return (
    <LoginUserProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/notes/:noteId" element={<Note />} />
        <Route path="/newNote" element={<NewNote />} />
        <Route path="/devices" element={<DeviceManagement />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </LoginUserProvider>
  )
})