import { memo, FC } from 'react'

import Layout from '../components/layout/Layout'

const NoteList: FC = memo(() => {
  return (
    <Layout>
      <h1>Note List Page</h1>
    </Layout>
  )
})

export default NoteList