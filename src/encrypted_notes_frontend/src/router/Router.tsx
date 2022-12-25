import { FC, memo } from 'react'
import { Routes, Route } from 'react-router-dom'

import DeviceList from '../pages/DeviceList'
import Login from '../pages/Login'
import NewNote from '../pages/NewNote'
import NoteList from '../pages/NoteList'
import Page404 from '../pages/Page404'

export const Router: FC = memo(() => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/notes" element={<NoteList />} />
      <Route path="/newNote" element={<NewNote />} />
      <Route path="/devices" element={<DeviceList />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  )
})