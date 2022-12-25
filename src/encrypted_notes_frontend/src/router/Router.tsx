import { FC, memo } from 'react'
import { Routes, Route } from 'react-router-dom'

import Devices from '../pages/Devices'
import Login from '../pages/Login'
import NewNote from '../pages/NewNote'
import Notes from '../pages/Notes'
import Page404 from '../pages/Page404'

export const Router: FC = memo(() => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/notes" element={<Notes />} />
      <Route path="/newNote" element={<NewNote />} />
      <Route path="/devices" element={<Devices />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  )
})