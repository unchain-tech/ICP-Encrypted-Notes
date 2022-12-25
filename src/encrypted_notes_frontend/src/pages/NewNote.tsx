import { memo, FC } from 'react'

import Layout from '../components/layout/Layout'

const NewNote: FC = memo(() => {
  return (
    <Layout>
      <h1>New Note Page</h1>
    </Layout>
  )
})

export default NewNote