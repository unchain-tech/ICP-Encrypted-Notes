import { FC } from 'react'
import { Routes, Route } from 'react-router-dom'

import Login from '../pages/Login'
import Notes from '../pages/Notes'
import EditNote from '../pages/EditNote'
import NewNote from '../pages/NewNote'
import Devices from '../pages/Devices'
import Page404 from '../pages/Page404'

import { LoginUserProvider } from '../providers/LoginUserProvider'

export const Router: FC = () => {
  return (
    <LoginUserProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/notes/:noteId" element={<EditNote />} />
        <Route path="/new" element={<NewNote />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </LoginUserProvider>
  )
}