import { memo, FC } from 'react'

import Layout from '../components/layout/Layout'
import Button from '../components/Button'
import TextInput from '../components/TextInput'

const NewNote: FC = memo(() => {
  return (
    <Layout>
      <span>New Note</span>
      <main className="p-4">
        <TextInput text="" />
      </main>
      <Button>ADD</Button>
    </Layout>
  )
})

export default NewNote